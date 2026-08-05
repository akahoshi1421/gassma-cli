import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { UnsupportedAttributeError } from "../../error/mainError";

const collectUniqueFields = (schemaText: string): string[] => {
  const ast = parsePrismaSchema(schemaText);

  return ast.declarations.flatMap((decl) => {
    if (decl.kind !== "model") return [];
    const modelName = decl.name.value;

    return decl.members.flatMap((member) => {
      if (member.kind !== "field") return [];
      const hasUnique = (member.attributes ?? []).some(
        (attr) =>
          attr.kind === "fieldAttribute" && attr.path.value[0] === "unique",
      );
      return hasUnique ? [`${modelName}.${member.name.value}`] : [];
    });
  });
};

const assertNoUniqueAttributes = (schemaText: string): void => {
  const fields = collectUniqueFields(schemaText);
  if (fields.length === 0) return;
  throw new UnsupportedAttributeError(fields);
};

export { assertNoUniqueAttributes, collectUniqueFields };
