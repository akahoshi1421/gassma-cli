import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

type UpdatedAtConfig = {
  [modelName: string]: string[];
};

const extractUpdatedAt = (schemaText: string): UpdatedAtConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: UpdatedAtConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const fields: string[] = [];

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;
      const hasUpdatedAt = (member.attributes ?? []).some(
        (attr) =>
          attr.kind === "fieldAttribute" && attr.path.value[0] === "updatedAt",
      );
      if (hasUpdatedAt) {
        fields.push(member.name.value);
      }
    });

    if (fields.length > 0) {
      result[decl.name.value] = fields;
    }
  });

  return result;
};

export { extractUpdatedAt };
export type { UpdatedAtConfig };
