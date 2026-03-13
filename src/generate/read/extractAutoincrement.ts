import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { findDefaultFieldAttribute } from "@loancrate/prisma-schema-parser/dist/attributes";

type AutoincrementConfig = {
  [modelName: string]: string[];
};

const extractAutoincrement = (schemaText: string): AutoincrementConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: AutoincrementConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const fields: string[] = [];

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;

      const defaultAttr = findDefaultFieldAttribute(member);
      if (!defaultAttr) return;

      const expr = defaultAttr.expression;
      if (
        expr.kind === "functionCall" &&
        expr.path.value[0] === "autoincrement"
      ) {
        fields.push(member.name.value);
      }
    });

    if (fields.length > 0) {
      result[decl.name.value] = fields;
    }
  });

  return result;
};

export { extractAutoincrement };
export type { AutoincrementConfig };
