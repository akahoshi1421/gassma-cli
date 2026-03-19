import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

const extractDatasourceUrl = (schemaText: string): string | null => {
  const ast = parsePrismaSchema(schemaText);

  for (const decl of ast.declarations) {
    if (decl.kind !== "datasource") continue;

    const urlConfig = decl.members.find(
      (m) => m.kind === "config" && m.name.value === "url",
    );

    if (urlConfig && urlConfig.kind === "config") {
      if (urlConfig.value.kind === "literal") {
        const value = urlConfig.value.value;
        if (typeof value === "string") return value;
      }
    }
  }

  return null;
};

export { extractDatasourceUrl };
