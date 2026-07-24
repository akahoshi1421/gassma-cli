import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

type MapSheetsConfig = {
  [modelName: string]: string;
};

const extractMapSheets = (schemaText: string): MapSheetsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: MapSheetsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const mapAttr = (decl.members ?? []).find(
      (member) =>
        member.kind === "blockAttribute" && member.path.value[0] === "map",
    );

    if (!mapAttr || mapAttr.kind !== "blockAttribute") return;

    const firstArg = mapAttr.args?.[0];
    if (!firstArg) return;

    const expr =
      firstArg.kind === "namedArgument" ? firstArg.expression : firstArg;

    if (expr.kind === "literal" && typeof expr.value === "string") {
      result[decl.name.value] = expr.value;
    }
  });

  return result;
};

export { extractMapSheets };
export type { MapSheetsConfig };
