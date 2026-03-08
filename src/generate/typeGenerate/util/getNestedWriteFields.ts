import type { RelationsConfig } from "../../read/extractRelations";

const getNestedWriteFields = (
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    return `${pre}    "${relationName}"?: Gassma.NestedWriteOperation;\n`;
  }, "");

  return fields;
};

export { getNestedWriteFields };
