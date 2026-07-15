import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(projectRoot, "..");
const sqlPath = path.resolve(workspaceRoot, "hcmpvdms_harisproject.sql");
const outPath = path.resolve(projectRoot, "data/drugs.json");

const sql = fs.readFileSync(sqlPath, "utf8");

const insertPrefix = "INSERT INTO `drugs_details`";

function splitTuples(valuesBlock) {
  const tuples = [];
  let i = 0;
  while (i < valuesBlock.length) {
    while (i < valuesBlock.length && valuesBlock[i] !== "(") i += 1;
    if (i >= valuesBlock.length) break;
    let start = i;
    let inString = false;
    i += 1;
    while (i < valuesBlock.length) {
      const ch = valuesBlock[i];
      const prev = valuesBlock[i - 1];
      if (ch === "'" && prev !== "\\") inString = !inString;
      if (!inString && ch === ")") break;
      i += 1;
    }
    tuples.push(valuesBlock.slice(start, i + 1));
    i += 1;
  }
  return tuples;
}

function parseTuple(tupleText) {
  const inner = tupleText.slice(1, -1);
  const fields = [];
  let current = "";
  let inString = false;

  for (let i = 0; i < inner.length; i += 1) {
    const ch = inner[i];
    const prev = i > 0 ? inner[i - 1] : "";
    if (ch === "'" && prev !== "\\") {
      inString = !inString;
      current += ch;
      continue;
    }
    if (ch === "," && !inString) {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current.trim());

  return fields.map((raw) => {
    if (/^null$/i.test(raw)) return null;
    if (raw.startsWith("'") && raw.endsWith("'")) {
      return raw
        .slice(1, -1)
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
        .replace(/\\r\\n/g, "\n")
        .replace(/\\n/g, "\n");
    }
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : raw;
  });
}

function extractDrugInsertStatements(source) {
  const statements = [];
  let i = 0;
  while (i < source.length) {
    const start = source.indexOf(insertPrefix, i);
    if (start === -1) break;
    let inString = false;
    let j = start;
    for (; j < source.length; j += 1) {
      const ch = source[j];
      const prev = j > 0 ? source[j - 1] : "";
      if (ch === "'" && prev !== "\\") inString = !inString;
      if (!inString && ch === ";") break;
    }
    statements.push(source.slice(start, j + 1));
    i = j + 1;
  }
  return statements;
}

const rows = [];
const statements = extractDrugInsertStatements(sql);
for (const statement of statements) {
  const colStart = statement.indexOf("(");
  const colEnd = statement.indexOf(")", colStart + 1);
  const columns = statement
    .slice(colStart + 1, colEnd)
    .split(",")
    .map((c) => c.replace(/`/g, "").trim());
  const valuesKeywordIdx = statement.indexOf("VALUES", colEnd);
  const valuesBlock = statement
    .slice(valuesKeywordIdx + "VALUES".length, statement.lastIndexOf(";"))
    .trim();
  const tuples = splitTuples(valuesBlock);
  for (const tuple of tuples) {
    const values = parseTuple(tuple);
    const obj = {};
    for (let i = 0; i < columns.length; i += 1) obj[columns[i]] = values[i];
    rows.push(obj);
  }
}

rows.sort((a, b) => String(a.drug_id).localeCompare(String(b.drug_id)));

const normalized = rows.map((row) => ({
  id: row.id,
  drugId: row.drug_id,
  name: row.drug_name,
  effects: row.drug_effects,
  nature: row.drug_nature,
  molecularTargets: row.molecular_targets,
  drugClass: row.drug_class,
  status: row.drug_status,
  source: row.drug_source,
  brandNames: row.brand_names,
  references: row.references,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
}));

fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      count: normalized.length,
      records: normalized,
    },
    null,
    2
  )
);

console.log(`Wrote ${normalized.length} records to ${outPath}`);
