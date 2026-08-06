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
import { extractOptionalRelations } from "../src/generate/read/extractOptionalRelations";
import { extractPreviewFeatures } from "../src/generate/read/extractPreviewFeatures";
import { validateSchema } from "../src/validate/validate";

const fixturePath = path.join(
  __dirname,
  "../src/__test__/types/fixtures/schema.prisma",
);
const schemaText = fs.readFileSync(fixturePath, "utf-8");

const outDir = path.join(__dirname, "../src/__test__/types/__generated__");
fs.mkdirSync(outDir, { recursive: true });

const generateFixture = (text: string, fileName: string) => {
  const validated = validateSchema(text);
  if (!validated.valid)
    throw new Error(
      `fixture schema is rejected by the CLI:\n${validated.errors
        .map((error) => `  - ${error.message}`)
        .join("\n")}`,
    );

  const parsed = prismaReader(text);
  const relations = extractRelations(text);
  const autoincrement = extractAutoincrement(text);
  const defaults = extractDefaults(text);
  const updatedAt = extractUpdatedAt(text);
  const optionalFields = extractOptionalFields(text);
  const optionalRelations = extractOptionalRelations(text);
  const strict = extractPreviewFeatures(text).includes(
    "strictUndefinedChecks",
  );

  const generated = generater(
    parsed,
    relations,
    "",
    true,
    defaults,
    Object.keys(updatedAt),
    autoincrement,
    optionalFields,
    strict,
    optionalRelations,
  );
  const clientDts = generateClientDts("", undefined, Object.keys(parsed));

  fs.writeFileSync(path.join(outDir, fileName), `${generated}\n${clientDts}`);
  console.log(`generated fixture types -> ${path.join(outDir, fileName)}`);
};

generateFixture(schemaText, "client.d.ts");

const strictSchemaText = schemaText.replace(
  'provider = "prisma-client-js"',
  'provider        = "prisma-client-js"\n  previewFeatures = ["strictUndefinedChecks"]',
);
generateFixture(strictSchemaText, "clientStrict.d.ts");
