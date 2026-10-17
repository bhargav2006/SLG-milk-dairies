/**
 * Compress images IN PLACE (same file name + same extension),
 * so the paths stored in MongoDB keep working. No DB change needed.
 *
 * Usage (run from the backend folder):
 *   node scripts/compressImages.js                      -> DRY RUN on uploads/products + uploads/defaults
 *   node scripts/compressImages.js --apply              -> really compress (originals backed up first)
 *   node scripts/compressImages.js uploads/products --max=700 --apply
 *   node scripts/compressImages.js ../frontend/public/logo.png --max=256 --apply
 *
 * Options:
 *   --max=800   longest side in pixels (default 800)
 *   --apply     actually write files (default is dry run)
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const MAX = parseInt((args.find((a) => a.startsWith("--max=")) || "--max=800").split("=")[1], 10);
const targets = args.filter((a) => !a.startsWith("--"));
if (targets.length === 0) targets.push("uploads/products", "uploads/defaults");

const BACKUP_ROOT = path.resolve("backup-images");
const EXT = /\.(jpe?g|png|webp)$/i;

function collect(p, out = []) {
  if (!fs.existsSync(p)) {
    console.log(`(skip) not found: ${p}`);
    return out;
  }
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    for (const f of fs.readdirSync(p)) collect(path.join(p, f), out);
  } else if (EXT.test(p)) {
    out.push(p);
  }
  return out;
}

async function compress(file) {
  const ext = path.extname(file).toLowerCase();
  let img = sharp(file).rotate(); // respect phone-camera orientation
  const meta = await sharp(file).metadata();
  img = img.resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true });

  if (ext === ".jpg" || ext === ".jpeg") img = img.jpeg({ quality: 78, mozjpeg: true });
  else if (ext === ".png") img = img.png({ compressionLevel: 9, palette: true, quality: 80 });
  else img = img.webp({ quality: 78 });

  const buf = await img.toBuffer();
  return { buf, from: `${meta.width}x${meta.height}` };
}

(async () => {
  const files = targets.flatMap((t) => collect(t));
  console.log(`${APPLY ? "APPLY" : "DRY RUN"} - ${files.length} images, max side ${MAX}px\n`);
  let before = 0, after = 0, changed = 0, failed = 0;

  for (const file of files) {
    try {
      const oldSize = fs.statSync(file).size;
      const { buf, from } = await compress(file);
      before += oldSize;

      if (buf.length >= oldSize) { // never make a file bigger
        after += oldSize;
        continue;
      }
      after += buf.length;
      changed++;
      console.log(`${file}  ${from}  ${(oldSize / 1024).toFixed(0)}KB -> ${(buf.length / 1024).toFixed(0)}KB`);

      if (APPLY) {
        const backup = path.join(BACKUP_ROOT, path.relative(process.cwd(), path.resolve(file)).replace(/\.\.[\\/]/g, ""));
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        if (!fs.existsSync(backup)) fs.copyFileSync(file, backup);
        const tmp = `${file}.tmp`;
        fs.writeFileSync(tmp, buf);
        fs.renameSync(tmp, file); // atomic replace
      }
    } catch (e) {
      failed++;
      console.log(`FAILED ${file}: ${e.message}`);
    }
  }

  const mb = (n) => (n / 1048576).toFixed(1);
  console.log(`\n${changed} files ${APPLY ? "compressed" : "would be compressed"}, ${failed} failed`);
  console.log(`Total: ${mb(before)} MB -> ${mb(after)} MB (saves ${mb(before - after)} MB)`);
  if (!APPLY) console.log("\nNothing was changed. Run again with --apply to write the files.");
  else console.log(`Originals are backed up in ${BACKUP_ROOT}`);
})();