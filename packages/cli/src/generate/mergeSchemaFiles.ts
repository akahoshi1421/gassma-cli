import fs from "fs";

const mergeSchemaFiles = (filePaths: string[]): string => {
  return filePaths.map((fp) => fs.readFileSync(fp, "utf-8")).join("\n\n");
};

export { mergeSchemaFiles };
