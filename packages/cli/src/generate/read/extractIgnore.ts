import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

type IgnoreConfig = {
  [modelName: string]: string[];
};

const extractIgnore = (schemaText: string): IgnoreConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: IgnoreConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const fields: string[] = [];

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;
      const hasIgnore = (member.attributes ?? []).some(
        (attr) =>
          attr.kind === "fieldAttribute" && attr.path.value[0] === "ignore",
      );
      if (hasIgnore) {
        fields.push(member.name.value);
      }
    });

    if (fields.length > 0) {
      result[decl.name.value] = fields;
    }
  });

  return result;
};

export { extractIgnore };
export type { IgnoreConfig };
