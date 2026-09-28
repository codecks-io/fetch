import {readFileSync, readdirSync, rmSync, writeFileSync} from "fs";
import {join} from "path";
import {generate, type ApiReference} from "./models-from-reference";

const MODEL_DIR = join(import.meta.dirname, "..", "src", "models");

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: vite-node scripts/generate-models.ts <path/to/shared/api-reference.json>");
  process.exit(1);
}
const reference = JSON.parse(readFileSync(inputPath, "utf-8")) as ApiReference;
// generate first, so that a reference this script can't place leaves the models untouched
const files = generate(reference);
// the hand-written helpers start with `_`; `_root.ts` and `_types.json` are generated
for (const file of readdirSync(MODEL_DIR)) {
  if (!file.startsWith("_") || file in files) rmSync(join(MODEL_DIR, file));
}
for (const [file, content] of Object.entries(files)) {
  writeFileSync(join(MODEL_DIR, file), content);
}
console.log(`Generated ${reference.models.length} models in src/models/`);
