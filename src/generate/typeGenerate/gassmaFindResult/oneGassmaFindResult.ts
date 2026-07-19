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

  const relationBranch = (
    source: string,
    childName: string,
    childArgs: string,
  ) =>
    relNames
      .map((relationName) => {
        const def = modelRelations[relationName];
        const targetFR = `${prefix}${def.to}${childName}`;
        const targetGO = `O extends { "${def.to}": infer TO } ? TO extends ${prefix}${def.to}Omit ? TO : {} : {}`;
        const inner = `${targetFR}<Gassma.SelectOf<${source}[K]>, Gassma.IncludeOf<${source}[K]>, Gassma.OmitOf<${source}[K]>, ${targetGO}, O${childArgs}>`;
        const isList = def.type === "oneToMany" || def.type === "manyToMany";
        const result = isList ? `${inner}[]` : `${inner} | null`;
        return `          K extends "${relationName}" ? ${result} :`;
      })
      .join("\n");

  const structural = (childName: string, childArgs: string) => {
    const selectResult = `{
      [K in keyof S as S[K] extends false | undefined
        ? never
        : K & (keyof ${self}DefaultFindResult | ${relKeyUnion})]:
${relationBranch("S", childName, childArgs)}
          K extends "_count" ? Gassma.CountResult<S[K]> :
          ${self}DefaultFindResult[K & keyof ${self}DefaultFindResult];
    }`;
    const omitResult = `{
      [K in keyof ${self}DefaultFindResult as K extends Gassma.ResolveOmitKeys<GO, QO>
        ? never
        : K]: ${self}DefaultFindResult[K];
    }`;
    const includePart = `(I extends undefined
    ? {}
    : {
        [K in keyof I as K extends ${relKeyUnion} ? K : never]:
${relationBranch("I", childName, childArgs)}
          K extends "_count" ? Gassma.CountResult<I[K]> :
          never;
      })`;
    return `(S extends ${self}FindSelect
  ? ${selectResult}
  : ${omitResult}) &
  ${includePart}`;
  };

  const at = `Gassma.At<CMap, "${sheetName}">`;

  return `
export type ${self}FindResultBase<S, I = undefined, QO = undefined, GO = {}, O = {}> = ${structural("FindResultBase", "")};

export type ${self}FindResultCore<S, I = undefined, QO = undefined, GO = {}, O = {}, CMap = {}> = ${structural("FindResult", ", CMap")};

export type ${self}FindResult<S, I = undefined, QO = undefined, GO = {}, O = {}, CMap = {}> = Gassma.WithComputed<
  ${self}FindResultCore<Gassma.StripComputed<S, ${at}>, I, QO, GO, O, CMap>,
  ${at},
  S,
  QO
>;
`;
};

export { getOneGassmaFindResult };
