import fs from "fs";
import path from "path";
import { validateSchema } from "./validate";
import { parseSchemaPath } from "../generate/parseSchemaPath";

type ValidateOptions = {
  schema?: string;
};

function validate(options?: ValidateOptions) {
  const files = resolveFiles(options);

  let hasError = false;

  files.forEach(({ filePath, displayName }) => {
    const schemaText = fs.readFileSync(filePath, "utf-8");
    const result = validateSchema(schemaText);

    if (result.valid) {
      console.log(`The schema at ${path.resolve(filePath)} is valid 🚀`);
    } else {
      hasError = true;
      console.error(`❌ Validation failed for ${displayName}:`);
      result.errors.forEach((error) => {
        console.error(`  - ${error.message}`);
      });
    }
  });

  if (hasError) {
    process.exit(1);
  }
}

function resolveFiles(
  options?: ValidateOptions,
): Array<{ filePath: string; displayName: string }> {
  if (options?.schema) {
    const { dir, file } = parseSchemaPath(options.schema);
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Schema file not found: ${filePath}`);
    }
    return [{ filePath, displayName: file }];
  }

  const gassmaDir = "./gassma";
  if (!fs.existsSync(gassmaDir)) {
    throw new Error(
      `${gassmaDir}/ directory not found. Please create ${gassmaDir}/ directory with .prisma files.`,
    );
  }

  const prismaFiles = fs
    .readdirSync(gassmaDir)
    .filter((file) => file.endsWith(".prisma"));

  if (prismaFiles.length === 0) {
    throw new Error(`No .prisma files found in ${gassmaDir}/ directory.`);
  }

  return prismaFiles.map((file) => ({
    filePath: path.join(gassmaDir, file),
    displayName: file,
  }));
}

export { validate };
