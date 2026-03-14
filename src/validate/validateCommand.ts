import fs from "fs";
import path from "path";
import { validateSchema } from "./validate";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";

type ValidateOptions = {
  schema?: string;
};

function validate(options?: ValidateOptions) {
  const files = resolveSchemaFiles({ schema: options?.schema });

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

export { validate };
