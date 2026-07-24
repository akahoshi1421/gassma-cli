import type { RelationsConfig } from "../../read/extractRelations";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaOrderBy = (
  sheetContent: Record<string, unknown[]>,
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
) => {
  const sk = skipUnion(strict);
  const scalarFields = Object.keys(sheetContent).reduce((pre, columnName) => {
    const isQuestionMark = columnName.at(-1) === "?";
    const removedQuestionMark = isQuestionMark
      ? columnName.substring(0, columnName.length - 1)
      : columnName;

    return `${pre}  "${removedQuestionMark}"?: "asc" | "desc" | Gassma.SortOrderInput${sk};\n`;
  }, `\nexport type Gassma${schemaName}${sheetName}OrderBy = {\n`);

  const modelRelations = relations?.[sheetName];
  const relationFields = modelRelations
    ? Object.keys(modelRelations).reduce((pre, relationName) => {
        const targetModel = modelRelations[relationName].to;
        return `${pre}  "${relationName}"?: Gassma${schemaName}${targetModel}OrderBy | { _count: "asc" | "desc" }${sk};\n`;
      }, "")
    : "";

  const countField =
    modelRelations && Object.keys(modelRelations).length > 0
      ? `  "_count"?: { ${Object.keys(modelRelations)
          .map((name) => `"${name}"?: "asc" | "desc"${sk}`)
          .join("; ")} }${sk};\n`
      : "";

  return `${scalarFields}${relationFields}${countField}};\n`;
};

export { getOneGassmaOrderBy };
