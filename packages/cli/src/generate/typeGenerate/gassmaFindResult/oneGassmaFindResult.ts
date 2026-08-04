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

  const relUnion = relNames.map((r) => `"${r}"`).join(" | ");
  const relKeyUnion =
    relNames.length > 0 ? `${relUnion} | "_count"` : `"_count"`;

  const relationBranch = (
    source: string,
    childName: string,
    childArgs: string,
  ) => {
    if (relNames.length === 0) return "";
    const entries = relNames
      .map((relationName) => {
        const def = modelRelations[relationName];
        const targetFR = `${prefix}${def.to}${childName}`;
        const targetGO = `O extends { "${def.to}": infer TO } ? TO extends ${prefix}${def.to}Omit ? TO : {} : {}`;
        const inner = `${targetFR}<Gassma.SelectOf<${source}[K]>, Gassma.IncludeOf<${source}[K]>, Gassma.OmitOf<${source}[K]>, ${targetGO}, O${childArgs}>`;
        const isList = def.type === "oneToMany" || def.type === "manyToMany";
        const result = isList ? `${inner}[]` : `${inner} | null`;
        return `            "${relationName}": ${result};`;
      })
      .join("\n");
    return `          K extends ${relUnion} ? {
${entries}
          }[K] :`;
  };

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
    // strictNullChecks が off だと undefined/unknown が任意プロパティのみの型にも
    // 代入可能になり、select 省略時にも select 側へ落ちる。SelectGiven は
    // 代入可能性でなく型の同一性で判定するため strict の有無に依存しない。
    // 外側の `S extends unknown` は union の S に対する分配を保つためのもの。
    return `(S extends unknown
  ? Gassma.SelectGiven<S> extends true
    ? ${selectResult}
    : ${omitResult}
  : never) &
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
