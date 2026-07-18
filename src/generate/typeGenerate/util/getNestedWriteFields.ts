import type {
  RelationDefinition,
  RelationsConfig,
} from "../../read/extractRelations";

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
): BaseOpTypes => {
  const childCreate =
    rel.type === "oneToMany" || rel.type === "oneToOne"
      ? `Omit<${target}Use, "${rel.reference}">`
      : `${target}Use`;
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
): string[] => {
  const base = buildBaseOpTypes(rel, target);
  const createManyOps =
    rel.type === "oneToMany"
      ? [`createMany?: { data: ${base.childCreate}[] }`]
      : [];

  return [
    `create?: ${base.createType}`,
    ...createManyOps,
    `connect?: ${base.connectType}`,
    `connectOrCreate?: ${base.connectOrCreateType}`,
  ];
};

const buildUpdateOnlyOps = (
  rel: RelationDefinition,
  target: string,
): string[] => {
  if (rel.type === "oneToMany") {
    return [
      `update?: { where: ${target}WhereUse; data: Partial<${target}Use> } | { where: ${target}WhereUse; data: Partial<${target}Use> }[]`,
      `delete?: ${target}WhereUse | ${target}WhereUse[]`,
      `deleteMany?: ${target}WhereUse | ${target}WhereUse[]`,
      `disconnect?: ${target}WhereUse | ${target}WhereUse[]`,
      `set?: ${target}WhereUse[]`,
    ];
  }
  if (rel.type === "oneToOne" || rel.type === "manyToOne") {
    return [
      `update?: Partial<${target}Use>`,
      "delete?: true",
      "disconnect?: true",
    ];
  }
  return [
    `disconnect?: ${target}WhereUse | ${target}WhereUse[]`,
    `set?: ${target}WhereUse[]`,
  ];
};

const buildUpdateContextOps = (
  rel: RelationDefinition,
  target: string,
): string[] => [
  ...buildCreateContextOps(rel, target),
  ...buildUpdateOnlyOps(rel, target),
];

const getNestedWriteFields = (
  schemaName: string,
  sheetName: string,
  relations: RelationsConfig | undefined,
  context: NestedWriteContext,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const relationNames = Object.keys(modelRelations).filter(
    (name) => context === "update" || modelRelations[name].type !== "manyToOne",
  );

  return relationNames.reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const target = `Gassma${schemaName}${rel.to}`;
    const ops =
      context === "create"
        ? buildCreateContextOps(rel, target)
        : buildUpdateContextOps(rel, target);

    return `${pre}    "${relationName}"?: { ${ops.join("; ")} };\n`;
  }, "");
};

export { getNestedWriteFields };
