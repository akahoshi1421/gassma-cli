import fs from "fs";
import path from "path";
import { parseSchemaPath } from "../generate/parseSchemaPath";
import { loadConfig } from "./loadConfig";

type SchemaOptions = {
  schema?: string;
};

type SchemaFile = {
  filePath: string;
  displayName: string;
};

const resolveSchemaFiles = (options: SchemaOptions): SchemaFile[] => {
  if (options.schema) {
    return resolveFromSchemaOption(options.schema);
  }

  const config = loadConfig();
  if (config?.schema) {
    return resolveFromConfigSchema(config.schema);
  }

  return resolveFromDefaultDir();
};

const resolveFromSchemaOption = (schema: string): SchemaFile[] => {
  if (
    !schema.endsWith(".prisma") &&
    fs.existsSync(schema) &&
    fs.statSync(schema).isDirectory()
  ) {
    return resolveFromDir(schema);
  }
  const { dir, file } = parseSchemaPath(schema);
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Schema file not found: ${filePath}`);
  }
  return [{ filePath, displayName: file }];
};

const resolveFromConfigSchema = (schema: string): SchemaFile[] => {
  if (schema.endsWith(".prisma")) {
    const filePath = schema;
    if (!fs.existsSync(filePath)) {
      throw new Error(`Schema file not found: ${filePath}`);
    }
    return [{ filePath, displayName: path.basename(filePath) }];
  }

  return resolveFromDir(schema);
};

const resolveFromDefaultDir = (): SchemaFile[] => {
  return resolveFromDir("./gassma");
};

const collectPrismaFiles = (
  baseDir: string,
  currentDir: string,
): SchemaFile[] => {
  const entries = fs.readdirSync(currentDir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      return collectPrismaFiles(baseDir, fullPath);
    }
    if (entry.name.endsWith(".prisma")) {
      return [
        {
          filePath: fullPath,
          displayName: path.relative(baseDir, fullPath),
        },
      ];
    }
    return [];
  });
};

const resolveFromDir = (dir: string): SchemaFile[] => {
  if (!fs.existsSync(dir)) {
    throw new Error(
      `${dir}/ directory not found. Please create ${dir}/ directory with .prisma files.`,
    );
  }

  const files = collectPrismaFiles(dir, dir);

  if (files.length === 0) {
    throw new Error(`No .prisma files found in ${dir}/ directory.`);
  }

  return files;
};

export { resolveSchemaFiles };
export type { SchemaFile };
