import type { RelationsConfig } from "../../read/extractRelations";

const isListRelation = (type: string): boolean =>
  type === "oneToMany" || type === "manyToMany";

const getNestedWriteFields = (
  schemaName: string,
  sheetName: string,
  relations?: RelationsConfig,
): string => {
  if (!relations) return "";
  const modelRelations = relations[sheetName];
  if (!modelRelations) return "";

  const fields = Object.keys(modelRelations).reduce((pre, relationName) => {
    const rel = modelRelations[relationName];
    const target = `Gassma${schemaName}${rel.to}`;
    const isList = isListRelation(rel.type);

    const createType = isList
      ? `${target}Use | ${target}Use[]`
      : `${target}Use`;
    const connectType = isList
      ? `${target}WhereUse | ${target}WhereUse[]`
      : `${target}WhereUse`;
    const connectOrCreateType = isList
      ? `{ where: ${target}WhereUse; create: ${target}Use } | { where: ${target}WhereUse; create: ${target}Use }[]`
      : `{ where: ${target}WhereUse; create: ${target}Use }`;

    const ops = [
      `create?: ${createType}`,
      `connect?: ${connectType}`,
      `connectOrCreate?: ${connectOrCreateType}`,
    ];

    if (rel.type === "oneToMany") {
      ops.push(
        `update?: { where: ${target}WhereUse; data: Partial<${target}Use> } | { where: ${target}WhereUse; data: Partial<${target}Use> }[]`,
      );
      ops.push(`delete?: boolean | ${target}WhereUse | ${target}WhereUse[]`);
      ops.push(`deleteMany?: ${target}WhereUse | ${target}WhereUse[]`);
      ops.push(
        `disconnect?: boolean | ${target}WhereUse | ${target}WhereUse[]`,
      );
      ops.push(`set?: ${target}WhereUse[]`);
    } else if (rel.type === "oneToOne") {
      ops.push(`update?: Partial<${target}Use>`);
      ops.push("delete?: true");
      ops.push("disconnect?: true");
    } else if (rel.type === "manyToMany") {
      ops.push(`disconnect?: ${target}WhereUse | ${target}WhereUse[]`);
      ops.push(`set?: ${target}WhereUse[]`);
    }

    return `${pre}    "${relationName}"?: { ${ops.join("; ")} };\n`;
  }, "");

  return fields;
};

export { getNestedWriteFields };
