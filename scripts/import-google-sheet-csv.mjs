import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const outCsvPath = path.resolve(projectRoot, "data/drugs.csv");

const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/import-google-sheet-csv.mjs <published-csv-url>");
  process.exit(1);
}

https
  .get(url, (res) => {
    if (res.statusCode !== 200) {
      console.error(`Download failed. Status: ${res.statusCode}`);
      process.exit(1);
    }
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      fs.writeFileSync(outCsvPath, body);
      console.log(`Saved CSV to ${outCsvPath}`);
      console.log("Now run: npm run import:csv");
    });
  })
  .on("error", (err) => {
    console.error(`Request error: ${err.message}`);
    process.exit(1);
  });
