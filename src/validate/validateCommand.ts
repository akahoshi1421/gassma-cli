import path from "path";
import { validateSchema } from "./validate";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";
import { filterOutputFiles } from "../config/filterOutputFiles";
import { mergeSchemaFiles } from "../generate/mergeSchemaFiles";

type ValidateOptions = {
  schema?: string;
};

function validate(options?: ValidateOptions) {
  const allFiles = resolveSchemaFiles({ schema: options?.schema });
  const baseDir =
    allFiles.length > 0 ? path.dirname(allFiles[0].filePath) : ".";
  const files = filterOutputFiles(allFiles, baseDir);
  const schemaText = mergeSchemaFiles(files.map((f) => f.filePath));

  const result = validateSchema(schemaText);

  if (result.valid) {
    console.log(`The schema at ${path.resolve(baseDir)} is valid 🚀`);
  } else {
    console.error("❌ Validation failed:");
    result.errors.forEach((error) => {
      console.error(`  - ${error.message}`);
    });
    process.exit(1);
  }
}

export { validate };
