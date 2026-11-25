import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
<div class="shell">
  <aside class="sidebar">
    <div class="brand"><div class="brand-mark">R</div><div><b>REALVIDEO <span>AI</span></b><small>CREATIVE STUDIO</small></div></div>
    <div class="side-label">WORKSPACE</div>
    <button class="nav active"><i>✦</i> Studio</button>
    <button class="nav" id="historyNav"><i>◷</i> Istoric local</button>
    <div class="side-bottom"><div class="status-dot"></div><span id="connection">Verific conexiunea…</span><div class="version">v1.0</div></div>
  </aside>
  <main>
    <header><div class="mobile-brand">REALVIDEO <span>AI</span></div><div class="crumb">Studio <b>/</b> Create video</div><div class="header-right"><span class="pill"><i></i> AI VIDEO ENGINE</span><button class="install" id="installBtn" hidden>＋ Instalează PWA</button></div></header>
    <section class="intro"><div><div class="eyebrow">AI VIDEO GENERATOR <span>● LIVE WORKSPACE</span></div><h1>Ideile tale.<br><em>Cadre incredibile.</em></h1><p>Transformă descrieri și imagini în videoclipuri cinematografice generate cu AI.</p></div><div class="hero-orb"><div class="orb-ring"></div><div class="orb-core">▶</div><small>CREATE<br>WITHOUT LIMITS</small></div></section>
    <div class="workspace">
      <section class="panel editor">
        <div class="panel-head"><div><span class="step">01</span><b>Configurează videoclipul</b></div><span class="subtle">GENERATION SETUP</span></div>
        <div class="mode-tabs"><button class="mode active" data-mode="text">✦ Text to Video</button><button class="mode" data-mode="image">▧ Image to Video</button></div>
        <label class="field-label" for="prompt">DESCRIE SCENA</label>
        <textarea id="prompt" rows="5" placeholder="Ex: Un BMW M4 negru conduce pe o șosea udă noaptea, pierde controlul și lovește un stâlp. Cameră cinematică, fizică realistă, reflexii naturale, slow motion la impact...">Un BMW M4 negru conduce pe o șosea urbană udă noaptea, pierde controlul și lovește un stâlp de iluminat. Cadru cinematic realist, fizică și deformarea caroseriei credibile, reflexii pe asfalt, camera urmărește mașina, fără persoane rănite vizibile.</textarea>
        <div class="prompt-foot"><span>Prompturile în engleză pot oferi rezultate mai bune.</span><button id="enhance">✧ Îmbunătățește promptul</button></div>
        <div class="upload" id="uploadBox" hidden><input type="file" id="imageFile" accept="image/png,image/jpeg,image/webp"/><div class="upload-icon">＋</div><div><b>Încarcă imaginea de început</b><small>PNG, JPG sau WEBP · max. 20 MB</small></div><button id="chooseFile">Alege fișier</button><img id="preview" alt="Previzualizare imagine" hidden></div>
        <div class="settings-grid">
          <div><label class="field-label">CALITATE / MOTOR</label><select id="quality"><option value="economy">ECONOMY · Kling 3.0 Standard</option><option value="pro" selected>PRO · Kling 3.0 Pro</option></select></div>
          <div><label class="field-label">DURATĂ TOTALĂ</label><select id="duration"><option value="15">15 secunde</option><option value="30" selected>30 secunde</option><option value="60">1 minut</option><option value="120">2 minute</option><option value="300">5 minute</option><option value="600">10 minute</option><option value="custom">Personalizată…</option></select></div>
          <div id="customDurationWrap" hidden><label class="field-label">DURATĂ PERSONALIZATĂ (SEC.)</label><input id="customDuration" type="number" min="5" max="1800" value="90" /></div>
          <div><label class="field-label">FORMAT</label><select id="ratio"><option value="9:16">9:16 · TikTok / Reels</option><option value="16:9">16:9 · YouTube</option><option value="1:1">1:1 · Pătrat</option></select></div>
          <div><label class="field-label">SUNET AI</label><select id="audio"><option value="true">Activat</option><option value="false">Dezactivat</option></select></div>
        </div>
        <div class="safety-note">ⓘ Clipurile lungi sunt create din scene scurte, apoi unite automat. Timpul și costul cresc odată cu durata.</div>
        <button class="generate" id="generate"><span>✦</span> GENEREAZĂ VIDEO <b>↗</b></button>
        <div class="error" id="error" hidden></div>
      </section>
      <section class="panel output">
        <div class="panel-head"><div><span class="step">02</span><b>Rezultatul tău</b></div><span class="subtle">VIDEO PREVIEW</span></div>
        <div class="preview-stage" id="stage"><div class="stage-glow"></div><div class="play-symbol">▶</div><b>Pregătit pentru creație</b><p>Videoclipul generat va apărea aici.</p><div class="stage-tag">REALVIDEO <span>AI</span></div></div>
        <div class="progress-wrap" id="progress" hidden><div class="progress-title"><span id="progressText">Se trimite cererea…</span><span class="spinner"></span></div><div class="progress-track"><div class="progress-bar"></div></div><small>Randarea poate dura câteva minute. Nu închide pagina.</small></div>
        <div class="result-actions" id="resultActions" hidden><a id="download" class="download" download="realvideo-ai.mp4">↓ Descarcă MP4</a><button id="openVideo">Deschide video ↗</button></div>
        <div class="tips"><div class="tip-icon">✧</div><div><b>Un sfat pentru realism</b><p>Descrie mișcarea camerei, lumina, materialele și succesiunea acțiunilor. Evită prea multe evenimente într-un singur clip.</p></div></div>
      </section>
    </div>
    <footer><span>© 2026 REALVIDEO AI STUDIO</span><span>POWERED BY <b>FAL + KLING</b></span></footer>
  </main>
</div>
<div class="toast" id="toast"></div>`;

let mode = 'text', imageFile = null, videoUrl = '';\n$('duration').addEventListener('change',()=>{$('customDurationWrap').hidden=$('duration').value!=='custom';});
const $ = id => document.getElementById(id);
const toast = msg => { $('toast').textContent=msg; $('toast').classList.add('show'); setTimeout(()=>$('toast').classList.remove('show'),3000); };
document.querySelectorAll('.mode').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.mode').forEach(x=>x.classList.toggle('active',x===btn));
  mode=btn.dataset.mode; $('uploadBox').hidden=mode!=='image';
}));
$('chooseFile').onclick=()=>$('imageFile').click();
$('uploadBox').onclick=e=>{if(e.target.id!=='chooseFile'&&e.target.id!=='imageFile')$('imageFile').click()};
$('imageFile').onchange=e=>{
  imageFile=e.target.files[0]; if(!imageFile)return;
  if(imageFile.size>20*1024*1024){toast('Imaginea depășește 20 MB.');imageFile=null;return;}
  $('preview').src=URL.createObjectURL(imageFile);$('preview').hidden=false;$('uploadBox').classList.add('has-image');
  $('uploadBox').querySelector('b').textContent=imageFile.name;
};
$('enhance').onclick=()=>{
  const p=$('prompt').value.trim(); if(!p)return toast('Scrie mai întâi o descriere.');
  $('prompt').value=p+', photorealistic cinematic cinematography, physically accurate motion, natural lighting, realistic textures, detailed environment, smooth camera movement, consistent objects, professional film color grading, no CGI look.';
  toast('Prompt îmbunătățit.');
};
$('historyNav').onclick=()=>toast('Istoricul local va apărea după prima generare.');

async function checkHealth(){
 try{const r=await fetch('/api/health');const d=await r.json();$('connection').textContent=d.configured?'Motor AI conectat':'Adaugă cheia FAL';$('connection').style.color=d.configured?'#58e6b1':'#ffbd6b';}
 catch{$('connection').textContent='Server indisponibil';$('connection').style.color='#ff8d8d';}
}
checkHealth();

$('generate').onclick=async()=>{
 const prompt=$('prompt').value.trim();
 if(!prompt)return toast('Adaugă o descriere a videoclipului.');
 if(mode==='image'&&!imageFile)return toast('Încarcă imaginea de început.');
 $('error').hidden=true;$('generate').disabled=true;$('generate').innerHTML='<span class="spinner"></span> SE GENEREAZĂ…';
 $('progress').hidden=false;$('resultActions').hidden=true;
 $('stage').innerHTML='<div class="stage-glow"></div><div class="play-symbol">✦</div><b>AI creează videoclipul</b><p>Modelul procesează scena ta…</p><div class="stage-tag">REALVIDEO <span>AI</span></div>';
 $('progressText').textContent='Se pregătește generarea…';
 try{
  const fd=new FormData();fd.append('prompt',prompt);fd.append('mode',mode);fd.append('quality',$('quality').value);const totalSeconds=$('duration').value==='custom'?Number($('customDuration').value):Number($('duration').value);\n  if(!Number.isFinite(totalSeconds)||totalSeconds<5||totalSeconds>1800)throw new Error('Durata personalizată trebuie să fie între 5 și 1800 de secunde (30 minute).');\n  fd.append('duration',String(totalSeconds));fd.append('aspectRatio',$('ratio').value);fd.append('audio',$('audio').value);
  if(imageFile)fd.append('image',imageFile);
  const response=await fetch('/api/generate',{method:'POST',body:fd});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Generarea a eșuat.');
  $('progressText').textContent='Randare în curs…';
  const video=data.video?.url;if(!video)throw new Error('Motorul AI nu a returnat un videoclip.');
  videoUrl=video;
  $('stage').innerHTML=`<video controls playsinline src="${video}" class="result-video"></video><div class="stage-tag">REALVIDEO <span>AI</span></div>`;
  $('download').href=video;$('resultActions').hidden=false;$('progress').hidden=true;toast('Videoclip generat cu succes!');
 }catch(err){$('error').textContent=err.message;$('error').hidden=false;$('progress').hidden=true;$('stage').innerHTML='<div class="play-symbol">!</div><b>Generarea nu a reușit</b><p>Verifică setările și cheia API.</p>'; }
 finally{$('generate').disabled=false;$('generate').innerHTML='<span>✦</span> GENEREAZĂ VIDEO <b>↗</b>';}
};
$('openVideo').onclick=()=>videoUrl&&window.open(videoUrl,'_blank','noopener');
let deferredPrompt;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;$('installBtn').hidden=false;});
$('installBtn').onclick=async()=>{if(deferredPrompt){deferredPrompt.prompt();deferredPrompt=null;}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));
