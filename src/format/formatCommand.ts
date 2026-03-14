import fs from "fs";
import path from "path";
import { formatSchema } from "@prisma/internals";
import { resolveSchemaFiles } from "../config/resolveSchemaFiles";

type FormatOptions = {
  schema?: string;
  check?: boolean;
};

async function format(options?: FormatOptions): Promise<boolean> {
  const files = resolveSchemaFiles({ schema: options?.schema });
  const schemas: [string, string][] = files.map(({ filePath }) => [
    path.basename(filePath),
    fs.readFileSync(filePath, "utf-8"),
  ]);

  const formatted = await formatSchema({ schemas });

  if (options?.check) {
    return files.every(({ filePath }, i) => {
      const original = fs.readFileSync(filePath, "utf-8");
      return original === formatted[i][1];
    });
  }

  files.forEach(({ filePath }, i) => {
    fs.writeFileSync(filePath, formatted[i][1], "utf-8");
    console.log(`Formatted ${path.resolve(filePath)} ✓`);
  });

  return true;
}

export { format };
