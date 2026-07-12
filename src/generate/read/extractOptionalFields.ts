import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { findDefaultFieldAttribute } from "@loancrate/prisma-schema-parser/dist/attributes";
import { isScalarField } from "./isScalarField";

type OptionalFieldsConfig = Record<string, string[]>;

const hasFieldAttribute = (
  member: Parameters<typeof findDefaultFieldAttribute>[0],
  name: string,
): boolean =>
  (member.attributes ?? []).some(
    (attr) => attr.kind === "fieldAttribute" && attr.path.value[0] === name,
  );

const hasModelIgnore = (decl: {
  members?: ReadonlyArray<{ kind: string; path?: { value: string[] } }>;
}): boolean =>
  (decl.members ?? []).some(
    (member) =>
      member.kind === "blockAttribute" && member.path?.value[0] === "ignore",
  );

const extractOptionalFields = (schemaText: string): OptionalFieldsConfig => {
  const ast = parsePrismaSchema(schemaText);
  const result: OptionalFieldsConfig = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;
    if (hasModelIgnore(decl)) return;

    const optionalFields: string[] = [];

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;
      if (!isScalarField(member, ast)) return;
      if (hasFieldAttribute(member, "ignore")) return;

      const isNullable = member.type.kind === "optional";
      const hasDefault = findDefaultFieldAttribute(member) !== undefined;
      const isUpdatedAt = hasFieldAttribute(member, "updatedAt");

      if (isNullable || hasDefault || isUpdatedAt) {
        optionalFields.push(member.name.value);
      }
    });

    result[decl.name.value] = optionalFields;
  });

  return result;
};

export { extractOptionalFields };
export type { OptionalFieldsConfig };
