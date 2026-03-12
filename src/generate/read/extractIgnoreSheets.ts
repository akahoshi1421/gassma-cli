import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";

const extractIgnoreSheets = (schemaText: string): string[] => {
  const ast = parsePrismaSchema(schemaText);
  const result: string[] = [];

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const hasModelIgnore = (decl.members ?? []).some(
      (member) =>
        member.kind === "blockAttribute" && member.path.value[0] === "ignore",
    );

    if (hasModelIgnore) {
      result.push(decl.name.value);
    }
  });

  return result;
};

export { extractIgnoreSheets };
