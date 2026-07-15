import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const inPath = path.resolve(projectRoot, "data/drugs.json");
const outPath = path.resolve(projectRoot, "data/drugs.csv");

const data = JSON.parse(fs.readFileSync(inPath, "utf8"));
const records = data.records || [];

const headers = [
  "drugId",
  "name",
  "effects",
  "nature",
  "molecularTargets",
  "drugClass",
  "status",
  "source",
  "brandNames",
  "references",
];

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

const lines = [headers.join(",")];
for (const row of records) {
  lines.push(headers.map((h) => csvEscape(row[h])).join(","));
}

fs.writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${records.length} rows to ${outPath}`);
