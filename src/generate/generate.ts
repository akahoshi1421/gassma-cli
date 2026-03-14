import fs from "fs";
import path from "path";
import { generater } from "./generator";
import { generateClientDts } from "./jsGenerate/generateClientDts";
import { generateClientJs } from "./jsGenerate/generateClientJs";
import { extractOutputPath } from "./read/extractOutputPath";
import { extractAutoincrement } from "./read/extractAutoincrement";
import { extractDefaults } from "./read/extractDefaults";
import { extractRelations } from "./read/extractRelations";
import { extractUpdatedAt } from "./read/extractUpdatedAt";
import { extractIgnore } from "./read/extractIgnore";
import { extractIgnoreSheets } from "./read/extractIgnoreSheets";
import { extractMap } from "./read/extractMap";
import { extractMapSheets } from "./read/extractMapSheets";
import { extractEnums } from "./read/extractEnums";
import { prismaReader } from "./read/prismaReader";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { writer } from "./writer";
import { jsWriter } from "./jsWriter";

type GenerateOptions = {
  schema?: string;
};

function generate(options?: GenerateOptions) {
  const files = resolveSchemaFiles({ schema: options?.schema });
  const dir = path.dirname(files[0].filePath);
  const fileNames = files.map((f) => f.displayName);
  generateFromFiles(dir, fileNames);
}

function findOutputPath(gassmaDir: string, prismaFiles: string[]): string {
  for (let i = 0; i < prismaFiles.length; i++) {
    const filePath = path.join(gassmaDir, prismaFiles[i]);
    const schemaText = fs.readFileSync(filePath, "utf-8");
    const outputPath = extractOutputPath(schemaText);
    if (outputPath) return outputPath;
  }
  throw new Error(
    "No output path found in any .prisma file. Please add 'output' to the generator block.\n" +
      'Example:\n  generator client {\n    provider = "prisma-client-js"\n    output   = "./generated/gassma"\n  }',
  );
}

function generateFromFiles(gassmaDir: string, prismaFiles: string[]) {
  console.log(
    `📁 Found ${prismaFiles.length} .prisma file(s) in ${path.basename(gassmaDir)} directory`,
  );

  const sharedOutputPath = findOutputPath(gassmaDir, prismaFiles);
  const commonWritten = new Set<string>();

  prismaFiles.forEach((file) => {
    const filePath = path.join(gassmaDir, file);
    console.log(`  📄 Processing: ${file}`);

    const schemaText = fs.readFileSync(filePath, "utf-8");

    const outputPath = extractOutputPath(schemaText) ?? sharedOutputPath;

    const parsed = prismaReader(schemaText);
    const relations = extractRelations(schemaText);
    const autoincrement = extractAutoincrement(schemaText);
    const defaults = extractDefaults(schemaText);
    const updatedAt = extractUpdatedAt(schemaText);
    const ignore = extractIgnore(schemaText);
    const ignoreSheets = extractIgnoreSheets(schemaText);
    const map = extractMap(schemaText);
    const mapSheets = extractMapSheets(schemaText);
    const enums = extractEnums(schemaText);
    const baseName = path.basename(file, ".prisma");
    const schemaName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
    const includeCommon = !commonWritten.has(outputPath);
    commonWritten.add(outputPath);
    const resultString = generater(
      parsed,
      relations,
      schemaName,
      includeCommon,
      defaults,
      Object.keys(updatedAt),
      Object.keys(autoincrement),
    );
    writer(resultString, baseName, outputPath);
    const clientJs = generateClientJs(
      relations,
      schemaName,
      defaults,
      updatedAt,
      ignore,
      map,
      ignoreSheets,
      mapSheets,
      autoincrement,
      enums,
    );
    jsWriter(clientJs, `${baseName}Client`, outputPath);
    const clientDts = generateClientDts(schemaName, enums);
    writer(clientDts, `${baseName}Client`, outputPath);
  });

  console.log(`✅ Generated ${prismaFiles.length} type definition file(s)`);
}

export { generate };
export type { GenerateOptions };
