import fs from "fs";
import path from "path";
import { formatSchema } from "@prisma/internals";
import { parseSchemaPath } from "../generate/parseSchemaPath";

type FormatOptions = {
  schema?: string;
  check?: boolean;
};

async function format(options?: FormatOptions): Promise<boolean> {
  const files = resolveFiles(options);
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

function resolveFiles(
  options?: FormatOptions,
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

export { format };
