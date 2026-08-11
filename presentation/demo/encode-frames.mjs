/**
 * Encode existing _frames/*.jpg into worknest-real-demo.webm via image2pipe
 * (Playwright ffmpeg has no image2 sequence demuxer).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'assets');
const framesDir = path.join(OUT_DIR, '_frames');
const FPS = 4;
const VIDEO_NAME = 'worknest-real-demo.webm';

function findPlaywrightFfmpeg() {
  const roots = [
    path.join(process.env.LOCALAPPDATA || '', 'ms-playwright'),
    path.join(process.env.LOCALAPPDATA || '', 'Temp', 'cursor-sandbox-cache'),
  ];
  for (const root of roots) {
    if (!root || !fs.existsSync(root)) continue;
    const stack = [root];
    while (stack.length) {
      const dir = stack.pop();
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const ent of entries) {
        const full = path.join(dir, ent.name);
        if (ent.isFile() && /ffmpeg-win64\.exe$/i.test(ent.name)) return full;
        if (ent.isDirectory() && !ent.name.startsWith('.')) stack.push(full);
      }
    }
  }
  return null;
}

const files = fs
  .readdirSync(framesDir)
  .filter((f) => /^frame_\d+\.jpg$/i.test(f))
  .sort();
if (files.length < 5) throw new Error(`Too few frames in ${framesDir}`);

const ff = findPlaywrightFfmpeg();
if (!ff) throw new Error('Playwright ffmpeg not found');

const dest = path.join(OUT_DIR, VIDEO_NAME);
const tmpOut = path.join(process.env.TEMP || process.env.TMP || OUT_DIR, `worknest-demo-${Date.now()}.webm`);
console.log(`Encoding ${files.length} frames @ ${FPS}fps via image2pipe…`);

await new Promise((resolve, reject) => {
  const child = spawn(
    ff,
    [
      '-y',
      '-f',
      'image2pipe',
      '-framerate',
      String(FPS),
        '-c:v',
        'mjpeg',
        '-i',
        'pipe:0',
        '-c:v',
        'libvpx',
      '-b:v',
      '2M',
      '-auto-alt-ref',
      '0',
      tmpOut,
    ],
    { stdio: ['pipe', 'inherit', 'inherit'] },
  );
  child.on('error', reject);
  child.on('close', (code) => {
    if (code === 0) resolve();
    else reject(new Error(`ffmpeg exited with code ${code}`));
  });
  (async () => {
    try {
      for (const name of files) {
        const ok = child.stdin.write(fs.readFileSync(path.join(framesDir, name)));
        if (!ok) await new Promise((r) => child.stdin.once('drain', r));
      }
      child.stdin.end();
    } catch (err) {
      child.kill();
      reject(err);
    }
  })();
});

fs.copyFileSync(tmpOut, dest);
fs.rmSync(tmpOut, { force: true });

const chaptersPath = path.join(OUT_DIR, 'chapters.json');
if (fs.existsSync(chaptersPath)) {
  const data = JSON.parse(fs.readFileSync(chaptersPath, 'utf8'));
  data.fps = FPS;
  data.frames = files.length;
  data.mode = data.mode || 'frame-synced-pop';
  fs.writeFileSync(chaptersPath, JSON.stringify(data, null, 2));
}

fs.rmSync(framesDir, { recursive: true, force: true });
console.log(`Saved ${dest} (${Math.round(fs.statSync(dest).size / 1024 / 1024)} MB)`);
console.log(`Duration ~${(files.length / FPS).toFixed(1)}s`);
