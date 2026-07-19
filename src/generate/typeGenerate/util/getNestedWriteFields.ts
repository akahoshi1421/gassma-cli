import type {
  RelationDefinition,
  RelationsConfig,
} from "../../read/extractRelations";
import { skipOptionalWrap, skipUnion } from "./skipUnion";

type NestedWriteContext = "create" | "update";

type BaseOpTypes = {
  childCreate: string;
  createType: string;
  connectType: string;
  connectOrCreateType: string;
};

const isListRelation = (type: string): boolean =>
  type === "oneToMany" || type === "manyToMany";

const buildBaseOpTypes = (
  rel: RelationDefinition,
  target: string,
  strict?: boolean,
): BaseOpTypes => {
  const rawChildCreate =
    rel.type === "oneToMany" || rel.type === "oneToOne"
      ? `Omit<${target}Use, "${rel.reference}">`
      : `${target}Use`;
  const childCreate = skipOptionalWrap(rawChildCreate, strict);
  const isList = isListRelation(rel.type);
  const createType = isList ? `${childCreate} | ${childCreate}[]` : childCreate;
  const connectType = isList
    ? `${target}WhereUse | ${target}WhereUse[]`
    : `${target}WhereUse`;
  const connectOrCreateSingle = `{ where: ${target}WhereUse; create: ${childCreate} }`;
  const connectOrCreateType = isList
    ? `${connectOrCreateSingle} | ${connectOrCreateSingle}[]`
    : connectOrCreateSingle;

  return { childCreate, createType, connectType, connectOrCreateType };
};

const buildCreateContextOps = (
  rel: RelationDefinition,
  target: string,
  strict?: boolean,
): string[] => {
  const sk = skipUnion(strict);
  const base = buildBaseOpTypes(rel, target, strict);
  const createManyOps =
    rel.type === "oneToMany"
      ? [`createMany?: { data: ${base.childCreate}[] }${sk}`]
      : [];

  return [
    `create?: ${base.createType}${sk}`,
    ...createManyOps,
    `connect?: ${base.connectType}${sk}`,
    `connectOrCreate?: ${base.connectOrCreateType}${sk}`,
  ];
};

const buildUpdateOnlyOps = (
  rel: RelationDefinition,
  target: string,
  strict?: boolean,
): string[] => {
  const sk = skipUnion(strict);
  const partialUpdate = skipOptionalWrap(`Partial<${target}Use>`, strict);
  if (rel.type === "oneToMany") {
    return [
      `update?: { where: ${target}WhereUse; data: ${partialUpdate} } | { where: ${target}WhereUse; data: ${partialUpdate} }[]${sk}`,
      `delete?: ${target}WhereUse | ${target}WhereUse[]${sk}`,
      `deleteMany?: ${target}WhereUse | ${target}WhereUse[]${sk}`,
      `disconnect?: ${target}WhereUse | ${target}WhereUse[]${sk}`,
      `set?: ${target}WhereUse[]${sk}`,
    ];
  }
  if (rel.type === "oneToOne" || rel.type === "manyToOne") {
    return [
      `update?: ${partialUpdate}${sk}`,
      `delete?: true${sk}`,
      `disconnect?: true${sk}`,
    ];
  }
  return [
    `disconnect?: ${target}WhereUse | ${target}WhereUse[]${sk}`,
    `set?: ${target}WhereUse[]${sk}`,
  ];
};

const buildUpdateContextOps = (
  rel: RelationDefinition,
  target: string,
  strict?: boolean,
): string[] => [
  ...buildCreateContextOps(rel, target, strict),
  ...buildUpdateOnlyOps(rel, target, strict),
];

const getNestedWriteFields = (
  schemaName: string,
  sheetName: string,
  relations: RelationsConfig | undefined,
  context: NestedWriteContext,
  strict?: boolean,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const sk = skipUnion(strict);
  const relationNames = Object.keys(modelRelations).filter(
    (name) => context === "update" || modelRelations[name].type !== "manyToOne",
  );

  return relationNames.reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const target = `Gassma${schemaName}${rel.to}`;
    const ops =
      context === "create"
        ? buildCreateContextOps(rel, target, strict)
        : buildUpdateContextOps(rel, target, strict);

    return `${pre}    "${relationName}"?: { ${ops.join("; ")} }${sk};\n`;
  }, "");
};

export { getNestedWriteFields };
