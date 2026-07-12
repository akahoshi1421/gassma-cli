import fs from "fs";
import path from "path";
import { generater } from "../src/generate/generator";
import { generateClientDts } from "../src/generate/jsGenerate/generateClientDts";
import { prismaReader } from "../src/generate/read/prismaReader";
import { extractRelations } from "../src/generate/read/extractRelations";
import { extractAutoincrement } from "../src/generate/read/extractAutoincrement";
import { extractDefaults } from "../src/generate/read/extractDefaults";
import { extractUpdatedAt } from "../src/generate/read/extractUpdatedAt";
import { extractOptionalFields } from "../src/generate/read/extractOptionalFields";

const fixturePath = path.join(
  __dirname,
  "../src/__test__/types/fixtures/schema.prisma",
);
const schemaText = fs.readFileSync(fixturePath, "utf-8");

const parsed = prismaReader(schemaText);
const relations = extractRelations(schemaText);
const autoincrement = extractAutoincrement(schemaText);
const defaults = extractDefaults(schemaText);
const updatedAt = extractUpdatedAt(schemaText);
const optionalFields = extractOptionalFields(schemaText);

const generated = generater(
  parsed,
  relations,
  "",
  true,
  defaults,
  Object.keys(updatedAt),
  Object.keys(autoincrement),
  optionalFields,
);
const clientDts = generateClientDts("");

const outDir = path.join(__dirname, "../src/__test__/types/__generated__");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "client.d.ts"),
  `${generated}\n${clientDts}`,
);

console.log(`generated fixture types -> ${path.join(outDir, "client.d.ts")}`);
