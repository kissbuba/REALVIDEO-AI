import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { fal } from '@fal-ai/client';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { randomUUID } from 'crypto';
import { spawn } from 'child_process';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));
if (process.env.FAL_KEY) fal.config({ credentials: process.env.FAL_KEY });

app.get('/api/health', (_req, res) => res.json({ configured: Boolean(process.env.FAL_KEY), ffmpeg: awaitCommand('ffmpeg', ['-version']) }));

function awaitCommand(command, args) {
  return new Promise(resolve => {
    const p = spawn(command, args, { stdio: 'ignore' });
    p.on('error', () => resolve(false));
    p.on('close', code => resolve(code === 0));
  });
}
function run(command, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(command, args, { stdio: ['ignore','ignore','pipe'] });
    let err = '';
    p.stderr.on('data', d => err += d.toString());
    p.on('error', reject);
    p.on('close', code => code === 0 ? resolve() : reject(new Error(err.slice(-1600) || `${command} failed`)));
  });
}
async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Nu am putut descărca scena (${r.status}).`);
  await fs.writeFile(file, Buffer.from(await r.arrayBuffer()));
}
async function uploadVideo(file) {
  const data = new File([await fs.readFile(file)], 'realvideo-ai-final.mp4', { type: 'video/mp4' });
  return await fal.storage.upload(data);
}

app.post('/api/generate', upload.single('image'), async (req, res) => {
  const temp = path.join(os.tmpdir(), `realvideo-${randomUUID()}`);
  try {
    if (!process.env.FAL_KEY) return res.status(503).json({ error: 'Motorul AI nu este configurat. Adaugă FAL_KEY în .env.' });
    const { prompt, mode, quality, duration, aspectRatio, audio } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: 'Promptul este obligatoriu.' });
    if (mode === 'image' && !req.file) return res.status(400).json({ error: 'Încarcă o imagine pentru Image to Video.' });
    const total = Number(duration);
    if (!Number.isInteger(total) || total < 5 || total > 1800) return res.status(400).json({ error: 'Durata trebuie să fie între 5 secunde și 30 de minute.' });
    const ffmpegOk = await awaitCommand('ffmpeg', ['-version']);
    if (total > 15 && !ffmpegOk) return res.status(503).json({ error: 'Pentru videoclipuri mai lungi de 15 secunde este necesar FFmpeg instalat pe server.' });

    await fs.mkdir(temp, { recursive: true });
    const tier = quality === 'economy' ? 'standard' : 'pro';
    const endpoint = `fal-ai/kling-video/v3/${tier}/${mode === 'image' ? 'image-to-video' : 'text-to-video'}`;
    const sceneLength = 15;
    const sceneCount = Math.ceil(total / sceneLength);
    let imageUrl = null;
    if (mode === 'image') {
      const image = new File([req.file.buffer], req.file.originalname || 'input-image.jpg', { type: req.file.mimetype });
      imageUrl = await fal.storage.upload(image);
    }
    const sceneFiles = [];
    for (let i = 0; i < sceneCount; i++) {
      const remaining = total - i * sceneLength;
      const seconds = Math.min(sceneLength, remaining);
      const scenePrompt = sceneCount === 1 ? prompt.trim() :
        `${prompt.trim()}\n\nSCENE ${i+1} OF ${sceneCount}. This is a continuous sequence in the same film. Preserve the exact same vehicle, colors, characters, wardrobe, location, weather, time of day, lighting and visual style from the preceding scene. Continue the action naturally from the previous moment. Avoid sudden changes or introducing unrelated objects. This segment lasts approximately ${seconds} seconds.`;
      const input = {
        prompt: scenePrompt,
        duration: String(seconds <= 5 ? 5 : seconds <= 10 ? 10 : 15),
        generate_audio: audio !== 'false',
        aspect_ratio: ['9:16','16:9','1:1'].includes(aspectRatio) ? aspectRatio : '9:16',
        enable_safety_checker: true
      };
      if (i === 0 && imageUrl) input.start_image_url = imageUrl;
      console.log(`Generating scene ${i+1}/${sceneCount} (${input.duration}s)`);
      const result = await fal.subscribe(endpoint, {
        input, logs: true,
        onQueueUpdate: update => {
          if (update.status === 'IN_PROGRESS') console.log(`[scene ${i+1}]`, update.logs?.map(x=>x.message).join('\n') || 'in progress');
        }
      });
      if (!result?.data?.video?.url) throw new Error(`Modelul nu a returnat videoclipul pentru scena ${i+1}.`);
      const file = path.join(temp, `scene-${String(i).padStart(4,'0')}.mp4`);
      await download(result.data.video.url, file);
      sceneFiles.push(file);
    }

    let finalFile = sceneFiles[0];
    if (sceneFiles.length > 1) {
      const listFile = path.join(temp, 'concat.txt');
      await fs.writeFile(listFile, sceneFiles.map(f => `file '${f.replace(/'/g, "'\\''")}'`).join('\n'));
      finalFile = path.join(temp, 'final.mp4');
      await run('ffmpeg', ['-y','-f','concat','-safe','0','-i',listFile,'-c:v','libx264','-preset','veryfast','-crf','20','-c:a','aac','-movflags','+faststart',finalFile]);
    }
    const finalUrl = sceneFiles.length === 1
      ? (await fal.storage.upload(new File([await fs.readFile(finalFile)], 'realvideo-ai.mp4', {type:'video/mp4'})))
      : await uploadVideo(finalFile);
    res.json({ video: { url: finalUrl }, duration: total, scenes: sceneCount, model: endpoint });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err?.message || 'Eroare la generarea videoclipului.' });
  } finally {
    fs.rm(temp, { recursive: true, force: true }).catch(()=>{});
  }
});

app.get('*', (_req,res)=>res.sendFile(path.join(__dirname,'dist','index.html')));
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`REALVIDEO AI rulează pe http://localhost:${port}`));
