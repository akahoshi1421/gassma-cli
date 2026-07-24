import path from "path";

type SchemaPathResult = {
  dir: string;
  file: string;
};

const parseSchemaPath = (schemaPath: string): SchemaPathResult => {
  if (!schemaPath.endsWith(".prisma")) {
    throw new Error(
      `Invalid schema path: ${schemaPath}. File must end with .prisma`,
    );
  }

  const dir = path.dirname(schemaPath);
  if (dir === ".") {
    throw new Error(
      `Invalid schema path: ${schemaPath}. Please include the directory (e.g., gassma/test.prisma)`,
    );
  }

  const file = path.basename(schemaPath);

  return { dir, file };
};

export { parseSchemaPath };
export type { SchemaPathResult };
