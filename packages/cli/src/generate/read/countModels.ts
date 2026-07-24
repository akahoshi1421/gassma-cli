import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

type PrismaAst = ReturnType<typeof parsePrismaSchema>;

function hasModelIgnoreAttribute(decl: {
  members?: ReadonlyArray<{ kind: string; path?: { value: string[] } }>;
}): boolean {
  return (decl.members ?? []).some(
    (member) =>
      member.kind === "blockAttribute" && member.path?.value[0] === "ignore",
  );
}

function countModelsInAst(ast: PrismaAst): number {
  return ast.declarations.filter(
    (decl) => decl.kind === "model" && !hasModelIgnoreAttribute(decl),
  ).length;
}

function countModels(schemaText: string): number {
  return countModelsInAst(parsePrismaSchema(schemaText));
}

export { countModels, countModelsInAst, hasModelIgnoreAttribute };
