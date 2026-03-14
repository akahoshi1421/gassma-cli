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

const resolveFromDir = (dir: string): SchemaFile[] => {
  if (!fs.existsSync(dir)) {
    throw new Error(
      `${dir}/ directory not found. Please create ${dir}/ directory with .prisma files.`,
    );
  }

  const prismaFiles = fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".prisma"));

  if (prismaFiles.length === 0) {
    throw new Error(`No .prisma files found in ${dir}/ directory.`);
  }

  return prismaFiles.map((file) => ({
    filePath: path.join(dir, file),
    displayName: file,
  }));
};

export { resolveSchemaFiles };
export type { SchemaFile };
