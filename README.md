# REALVIDEO AI — PWA

Studio PWA pentru Android și PC, cu generare video reală prin API-ul fal.ai + Kling 3.0.

## Funcții
- Text to Video și Image to Video
- Economy (Kling 3.0 Standard) și Pro (Kling 3.0 Pro)
- Durate de 15 secunde până la 30 de minute (clipurile lungi sunt împărțite în segmente și unite cu FFmpeg)\n- 9:16 / 16:9 / 1:1
- Audio generat de model (unde este suportat)
- PWA instalabilă și preview MP4

## Cerințe
- Node.js 20+\n- FFmpeg instalat pe server pentru clipuri de peste 15 secunde
- Cheie API fal.ai: https://fal.ai/dashboard/keys
- Conexiune la internet

## Pornire locală
1. Dezarhivează proiectul.
2. În terminal, în folderul proiectului:
   ```bash
   npm install
   ```
3. Copiază `.env.example` în `.env` și completează `FAL_KEY` cu cheia ta.
4. Rulează:
   ```bash
   npm run dev
   ```
5. Deschide http://localhost:5173 (Vite) sau http://localhost:3000 după `npm run build && npm start`.

În dezvoltare, cererile `/api` sunt trimise către serverul Express de pe portul 3000; configurează proxy-ul Vite dacă folosești portul 5173. Recomandat: deschide aplicația de pe portul 3000 după build pentru un flux simplu.

## Build / producție
```bash
npm run build
npm start
```
Publică aplicația pe un hosting Node.js care suportă Express (de ex. Render, Railway sau VPS). Pentru instalare PWA pe Android și PC, site-ul public trebuie servit prin HTTPS.

## Securitate și costuri
- Cheia FAL rămâne numai pe server, în `.env`; nu o pune în codul frontend și nu o trimite nimănui.
- Generarea video este un serviciu plătit/contorizat de fal.ai. Economy folosește endpoint-ul Standard; Pro folosește endpoint-ul Pro. Verifică prețurile curente în dashboard înainte de randare.
- Cheia API nu este inclusă în arhivă. Fără ea, interfața pornește, dar generarea reală returnează un mesaj de configurare.
- Clipurile sunt returnate ca URL de stocare fal.ai; descarcă-le și păstrează-le local.
- Aplicația este un starter funcțional, nu include autentificare, facturare pentru utilizatori sau stocare persistentă multi-user.

## Durate lungi
Interfața permite selectarea duratei totale de la 15 secunde la 30 de minute sau introducerea unei durate personalizate în secunde. Serverul generează secvențe de maximum 15 secunde și le concatenează cu FFmpeg. Modelele pot interpreta fiecare segment separat, astfel că continuitatea vizuală și audio nu este garantată. Cererile lungi pot dura mult, consuma mai multe credite și pot depăși limitele de execuție ale unor servicii de hosting. Pentru producție, folosește un worker/server cu timp de execuție suficient.
