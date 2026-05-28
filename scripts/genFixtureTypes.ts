import fs from "fs";
import path from "path";
import { generater } from "../src/generate/generator";
import { generateClientDts } from "../src/generate/jsGenerate/generateClientDts";
import { prismaReader } from "../src/generate/read/prismaReader";
import { extractRelations } from "../src/generate/read/extractRelations";

// 型レベルテスト（*.test-d.ts）用に、fixture スキーマから型定義を生成して固定出力する。
// vitest --typecheck の前（pretest:types）に実行される。
const fixturePath = path.join(
  __dirname,
  "../src/__test__/types/fixtures/schema.prisma",
);
const schemaText = fs.readFileSync(fixturePath, "utf-8");

const parsed = prismaReader(schemaText);
const relations = extractRelations(schemaText);
const generated = generater(parsed, relations);
const clientDts = generateClientDts("");

const outDir = path.join(__dirname, "../src/__test__/types/__generated__");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, "client.d.ts"),
  `${generated}\n${clientDts}`,
);

console.log(`generated fixture types -> ${path.join(outDir, "client.d.ts")}`);
