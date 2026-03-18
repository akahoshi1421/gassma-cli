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
import { filterOutputFiles } from "../config/filterOutputFiles";
import { loadConfig } from "../config/loadConfig";
import { mergeSchemaFiles } from "./mergeSchemaFiles";
import { writer } from "./writer";
import { jsWriter } from "./jsWriter";

type GenerateOptions = {
  schema?: string;
};

function generate(options?: GenerateOptions) {
  const allFiles = resolveSchemaFiles({ schema: options?.schema });
  const baseDir = findBaseDir(allFiles.map((f) => f.filePath));
  const files = filterOutputFiles(allFiles, baseDir);
  const config = loadConfig();
  const datasourceUrl = config?.datasource?.url;

  console.log(
    `📁 Found ${files.length} .prisma file(s) in ${path.basename(baseDir)} directory`,
  );
  files.forEach((f) => console.log(`  📄 ${f.displayName}`));

  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));
  const schemaName = deriveSchemaName(baseDir, files);
  generateFromSchema(schemaText, schemaName, datasourceUrl);
}

function findBaseDir(filePaths: string[]): string {
  if (filePaths.length === 1) return path.dirname(filePaths[0]);
  const dirs = filePaths.map((f) => path.dirname(f));
  const sorted = [...dirs].sort((a, b) => a.length - b.length);
  return sorted[0];
}

function deriveSchemaName(
  baseDir: string,
  files: { displayName: string }[],
): string {
  if (files.length === 1) {
    const baseName = path.basename(files[0].displayName, ".prisma");
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }
  const dirName = path.basename(baseDir);
  return dirName.charAt(0).toUpperCase() + dirName.slice(1);
}

function generateFromSchema(
  schemaText: string,
  schemaName: string,
  datasourceUrl?: string,
) {
  const outputPath = extractOutputPath(schemaText);
  if (!outputPath) {
    throw new Error(
      "No output path found. Please add 'output' to the generator block.\n" +
        'Example:\n  generator client {\n    provider = "prisma-client-js"\n    output   = "./generated/gassma"\n  }',
    );
  }

  const baseName = schemaName.charAt(0).toLowerCase() + schemaName.slice(1);
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

  const resultString = generater(
    parsed,
    relations,
    schemaName,
    true,
    defaults,
    Object.keys(updatedAt),
    Object.keys(autoincrement),
  );
  const clientDts = generateClientDts(schemaName, enums);
  const mergedDts = resultString + "\n" + clientDts;
  writer(mergedDts, `${baseName}Client`, outputPath);

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
    datasourceUrl,
  );
  jsWriter(clientJs, `${baseName}Client`, outputPath);

  console.log("✅ Generated type definitions successfully");
}

export { generate };
export type { GenerateOptions };
