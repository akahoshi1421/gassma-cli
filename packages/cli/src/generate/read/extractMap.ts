import {
  parsePrismaSchema,
  findFirstAttribute,
} from "@loancrate/prisma-schema-parser";

type MapConfig = {
  [modelName: string]: {
    [codeName: string]: string;
  };
};

const extractMap = (schemaText: string): MapConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: MapConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const fields: Record<string, string> = {};

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;

      const mapAttr = findFirstAttribute(member.attributes, "map");
      if (!mapAttr) return;

      const firstArg = mapAttr.args?.[0];
      if (!firstArg) return;

      const expr =
        firstArg.kind === "namedArgument" ? firstArg.expression : firstArg;

      if (expr.kind === "literal" && typeof expr.value === "string") {
        fields[member.name.value] = expr.value;
      }
    });

    if (Object.keys(fields).length > 0) {
      result[decl.name.value] = fields;
    }
  });

  return result;
};

export { extractMap };
export type { MapConfig };
