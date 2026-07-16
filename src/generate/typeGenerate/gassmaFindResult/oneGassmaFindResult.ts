import type { RelationsConfig } from "../../read/extractRelations";

const getOneGassmaFindResult = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
) => {
  const prefix = `Gassma${schemaName}`;
  const self = `${prefix}${sheetName}`;
  const modelRelations = relations?.[sheetName] ?? {};
  const relNames = Object.keys(modelRelations);

  const relKeyUnion =
    relNames.length > 0
      ? `${relNames.map((r) => `"${r}"`).join(" | ")} | "_count"`
      : `"_count"`;

  const relationBranch = (source: string) =>
    relNames
      .map((relationName) => {
        const def = modelRelations[relationName];
        const targetFR = `${prefix}${def.to}FindResult`;
        const targetGO = `O extends { "${def.to}": infer TO } ? TO extends ${prefix}${def.to}Omit ? TO : {} : {}`;
        const inner = `${targetFR}<Gassma.SelectOf<${source}[K]>, Gassma.IncludeOf<${source}[K]>, Gassma.OmitOf<${source}[K]>, ${targetGO}, O>`;
        const isList = def.type === "oneToMany" || def.type === "manyToMany";
        const result = isList ? `${inner}[]` : `${inner} | null`;
        return `          K extends "${relationName}" ? ${result} :`;
      })
      .join("\n");

  const selectResult = `{
      [K in keyof S as S[K] extends false | undefined
        ? never
        : K & (keyof ${self}DefaultFindResult | ${relKeyUnion})]:
${relationBranch("S")}
          K extends "_count" ? Gassma.CountResult<S[K]> :
          ${self}DefaultFindResult[K & keyof ${self}DefaultFindResult];
    }`;

  const omitResult = `{
      [K in keyof ${self}DefaultFindResult as K extends Gassma.ResolveOmitKeys<GO, QO>
        ? never
        : K]: ${self}DefaultFindResult[K];
    }`;

  const baseResult = `(S extends ${self}FindSelect
  ? ${selectResult}
  : ${omitResult})`;

  const includeBranches = relationBranch("I");

  const includePart = `(I extends undefined
    ? {}
    : {
        [K in keyof I as K extends ${relKeyUnion} ? K : never]:
${includeBranches}
          K extends "_count" ? Gassma.CountResult<I[K]> :
          never;
      })`;

  return `
export type ${self}FindResult<S, I = undefined, QO = undefined, GO = {}, O = {}> = ${baseResult} &
  ${includePart};
`;
};

export { getOneGassmaFindResult };
