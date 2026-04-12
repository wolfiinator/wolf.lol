import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MUSIC_DIR = path.join(ROOT, 'music');
const OUTPUT_FILE = path.join(ROOT, 'custom-player-manifest.json');

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac']);
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);

const toPosixPath = (value) => value.split(path.sep).join('/');

const prettifyName = (value) => value
  .replace(/\.[^.]+$/, '')
  .replace(/[._-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

async function exists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readDirectoryEntries(dirPath) {
  try {
    return await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }
}

async function findFirstImageFile(dirPath) {
  const entries = await readDirectoryEntries(dirPath);
  const files = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));

  return files[0] || null;
}

async function collectAudioFiles(dirPath) {
  const entries = await readDirectoryEntries(dirPath);
  const collected = [];

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      const nested = await collectAudioFiles(fullPath);
      collected.push(...nested);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (AUDIO_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      collected.push(fullPath);
    }
  }

  return collected;
}

async function buildManifest() {
  if (!(await exists(MUSIC_DIR))) {
    return { artists: [] };
  }

  const artistEntries = (await fs.readdir(MUSIC_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name));

  const artists = [];

  for (const artistEntry of artistEntries) {
    const artistPath = path.join(MUSIC_DIR, artistEntry.name);
    const audioFiles = await collectAudioFiles(artistPath);

    const tracks = [];
    for (const audioPath of audioFiles) {
      const trackRelativePath = toPosixPath(path.relative(artistPath, audioPath));
      const trackDirectory = path.dirname(audioPath);
      const coverFileName = await findFirstImageFile(trackDirectory);

      tracks.push({
        file: trackRelativePath,
        title: prettifyName(path.basename(trackRelativePath)),
        cover: coverFileName ? toPosixPath(path.relative(artistPath, path.join(trackDirectory, coverFileName))) : null
      });
    }

    artists.push({
      name: artistEntry.name,
      folder: `music/${artistEntry.name}`,
      tracks
    });
  }

  return { artists };
}

const manifest = await buildManifest();
await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${OUTPUT_FILE}`);
