import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

type EnumsConfig = Record<string, string[]>;

const extractEnums = (schemaText: string): EnumsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: EnumsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "enum") return;

    const values = decl.members
      .filter((member) => member.kind === "enumValue")
      .map((member) => member.name.value);

    result[decl.name.value] = values;
  });

  return result;
};

export { extractEnums };
export type { EnumsConfig };
