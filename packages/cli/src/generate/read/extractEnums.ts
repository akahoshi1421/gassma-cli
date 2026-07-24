import {
  parsePrismaSchema,
  findFirstAttribute,
} from "@loancrate/prisma-schema-parser";

type EnumEntry = {
  name: string;
  value: string;
};

type EnumsConfig = Record<string, EnumEntry[]>;

const extractEnums = (schemaText: string): EnumsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: EnumsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "enum") return;

    const entries = decl.members
      .filter((member) => member.kind === "enumValue")
      .map((member) => {
        const name = member.name.value;
        const mapAttr = findFirstAttribute(member.attributes, "map");
        if (!mapAttr) return { name, value: name };

        const firstArg = mapAttr.args?.[0];
        if (!firstArg) return { name, value: name };

        const expr =
          firstArg.kind === "namedArgument" ? firstArg.expression : firstArg;

        if (expr.kind === "literal" && typeof expr.value === "string") {
          return { name, value: expr.value };
        }

        return { name, value: name };
      });

    result[decl.name.value] = entries;
  });

  return result;
};

export { extractEnums };
export type { EnumsConfig, EnumEntry };
