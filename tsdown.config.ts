import {defineConfig} from "tsdown";
import {readFileSync} from "fs";

// Read package.json and extract entry points from exports
const pkg = JSON.parse(readFileSync("./package.json", "utf-8"));
const entries: string[] = [];

for (const [key, value] of Object.entries(pkg.exports)) {
  // Skip package.json and other non-code exports
  if (typeof value !== "string" || !value.startsWith("./dist/") || !value.endsWith(".js")) {
    continue;
  }

  // Convert dist path to src path with .ts extension
  const srcPath = value.replace("./dist/", "./src/").replace(/\.js$/, ".ts");
  entries.push(srcPath);
}

export default defineConfig([
  {
    entry: entries,
    platform: "neutral",
    dts: true,
  },
]);
