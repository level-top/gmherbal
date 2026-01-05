import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const projectRoot = process.cwd();
const publicDir = path.join(projectRoot, "public");

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readPngAsSharp(filePath) {
  const input = await fs.readFile(filePath);
  return sharp(input, { failOn: "none" });
}

async function generateIcoFromPng(pngPath, outIcoPath) {
  const base = await readPngAsSharp(pngPath);
  const png16 = await base
    .clone()
    .resize(16, 16, { fit: "contain" })
    .png()
    .toBuffer();
  const png32 = await base
    .clone()
    .resize(32, 32, { fit: "contain" })
    .png()
    .toBuffer();

  const ico = await pngToIco([png16, png32]);
  await fs.writeFile(outIcoPath, ico);
}

async function writePng(pngPath, outPngPath, size) {
  const img = await readPngAsSharp(pngPath);
  const buf = await img
    .resize(size, size, { fit: "contain" })
    .png()
    .toBuffer();
  await fs.writeFile(outPngPath, buf);
}

async function main() {
  const primaryPng = path.join(publicDir, "favicon.png");
  const secondaryPng = path.join(publicDir, "favicon-2.png");

  if (!(await fileExists(primaryPng))) {
    throw new Error(`Missing ${primaryPng}`);
  }
  if (!(await fileExists(secondaryPng))) {
    throw new Error(`Missing ${secondaryPng}`);
  }

  // Primary outputs
  const outFaviconIco = path.join(publicDir, "favicon.ico");
  const outIcon16 = path.join(publicDir, "icon-16.png");
  const outIcon32 = path.join(publicDir, "icon-32.png");
  const outApple = path.join(publicDir, "apple-touch-icon.png");

  // Secondary outputs (alternate icon set)
  const outFavIco = path.join(publicDir, "fav.ico");
  const outAlt16 = path.join(publicDir, "icon-16-alt.png");
  const outAlt32 = path.join(publicDir, "icon-32-alt.png");

  await generateIcoFromPng(primaryPng, outFaviconIco);
  await writePng(primaryPng, outIcon16, 16);
  await writePng(primaryPng, outIcon32, 32);
  await writePng(primaryPng, outApple, 180);

  await generateIcoFromPng(secondaryPng, outFavIco);
  await writePng(secondaryPng, outAlt16, 16);
  await writePng(secondaryPng, outAlt32, 32);

  // Next.js App Router will preferentially serve src/app/favicon.ico if present.
  // Keep it in sync with the generated primary favicon.
  const appFaviconIco = path.join(projectRoot, "src", "app", "favicon.ico");
  if (await fileExists(appFaviconIco)) {
    await fs.copyFile(outFaviconIco, appFaviconIco);
  }

  console.log("Favicons generated:");
  console.log("- public/favicon.ico (from favicon.png)");
  console.log("- public/fav.ico (from favicon-2.png)");
  console.log("- public/icon-16.png, public/icon-32.png, public/apple-touch-icon.png");
  console.log("- public/icon-16-alt.png, public/icon-32-alt.png");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
