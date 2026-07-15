import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const inPath = path.resolve(projectRoot, "data/drugs.csv");
const outPath = path.resolve(projectRoot, "data/drugs.json");

const csv = fs.readFileSync(inPath, "utf8");

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '"' && inQuotes && next === '"') {
      current += '"';
      i += 1;
      continue;
    }
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out;
}

const lines = csv
  .split(/\r?\n/)
  .map((l) => l.trimEnd())
  .filter(Boolean);

if (lines.length < 2) {
  throw new Error("CSV must include header and at least one row.");
}

const headers = parseCsvLine(lines[0]);
const required = [
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

for (const field of required) {
  if (!headers.includes(field)) throw new Error(`Missing column: ${field}`);
}

const records = [];
for (let i = 1; i < lines.length; i += 1) {
  const values = parseCsvLine(lines[i]);
  const obj = {};
  for (let c = 0; c < headers.length; c += 1) {
    obj[headers[c]] = values[c] ?? "";
  }
  if (!obj.drugId || !obj.name) continue;
  records.push({
    id: i,
    drugId: obj.drugId,
    name: obj.name,
    effects: obj.effects,
    nature: obj.nature,
    molecularTargets: obj.molecularTargets,
    drugClass: obj.drugClass,
    status: obj.status,
    source: obj.source,
    brandNames: obj.brandNames,
    references: obj.references,
    createdAt: null,
    updatedAt: null,
  });
}

records.sort((a, b) => a.drugId.localeCompare(b.drugId));

fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: records.length,
      records,
    },
    null,
    2
  )
);

console.log(`Converted ${records.length} records to ${outPath}`);
