import type { RelationsConfig } from "../../read/extractRelations";
import { skipUnion } from "../util/skipUnion";

const getOneGassmaCountValue = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
  strict?: boolean,
): string => {
  const modelRelations = relations?.[sheetName];
  if (!modelRelations || Object.keys(modelRelations).length === 0) {
    return `\nexport type Gassma${schemaName}${sheetName}CountValue = true;\n`;
  }

  const sk = skipUnion(strict);
  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const targetModel = modelRelations[relationName].to;
    return `${pre}    "${relationName}"?: true | { where?: Gassma${schemaName}${targetModel}WhereUse${sk} }${sk};\n`;
  }, "");

  return `\nexport type Gassma${schemaName}${sheetName}CountValue = true | { select: {\n${fields}  } };\n`;
};

export { getOneGassmaCountValue };
