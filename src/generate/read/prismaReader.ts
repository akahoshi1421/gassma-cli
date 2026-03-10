import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
import { findDefaultFieldAttribute } from "@loancrate/prisma-schema-parser/dist/attributes";
import { mapPrismaType } from "./mapPrismaType";
import { isScalarField } from "./isScalarField";
import { extractAddTypes, extractReplaceTypes } from "./extractAddTypes";
import { extractEnums } from "./extractEnums";

function prismaReader(
  schemaText: string,
): Record<string, Record<string, unknown[]>> {
  const ast = parsePrismaSchema(schemaText);
  const addTypes = extractAddTypes(schemaText);
  const replaceTypes = extractReplaceTypes(schemaText);
  const enums = extractEnums(schemaText);
  const result: Record<string, Record<string, unknown[]>> = {};

  ast.declarations.forEach((decl) => {
    if (decl.kind !== "model") return;

    const modelName = decl.name.value;
    const fields: Record<string, unknown[]> = {};

    decl.members.forEach((member) => {
      if (member.kind !== "field") return;
      if (!isScalarField(member, ast)) return;

      const isOptional = member.type.kind === "optional";
      const hasNonAutoDefault = hasNonAutoincrementDefault(member);
      const isUpdatedAt = hasUpdatedAtAttribute(member);
      const baseType =
        member.type.kind === "optional" || member.type.kind === "required"
          ? member.type.type
          : member.type;
      if (baseType.kind === "unsupported" || baseType.kind === "list") return;

      const typeName = baseType.name.value;
      const fieldName =
        isOptional || hasNonAutoDefault || isUpdatedAt
          ? `${member.name.value}?`
          : member.name.value;

      const enumValues = enums[typeName];
      if (enumValues) {
        fields[fieldName] = enumValues;
        return;
      }

      const replace = replaceTypes[modelName]?.[member.name.value];
      if (replace) {
        fields[fieldName] = replace;
        return;
      }

      const tsType = mapPrismaType(typeName);
      const extra = addTypes[modelName]?.[member.name.value] ?? [];
      fields[fieldName] = [tsType, ...extra];
    });

    result[modelName] = fields;
  });

  return result;
}

const SKIP_DEFAULT_FUNCTIONS = ["autoincrement"];

function hasNonAutoincrementDefault(
  member: Parameters<typeof findDefaultFieldAttribute>[0],
): boolean {
  const attr = findDefaultFieldAttribute(member);
  if (!attr) return false;
  if (attr.expression.kind === "functionCall") {
    const funcName = attr.expression.path.value[0];
    return SKIP_DEFAULT_FUNCTIONS.indexOf(funcName) === -1;
  }
  return true;
}

function hasUpdatedAtAttribute(
  member: Parameters<typeof findDefaultFieldAttribute>[0],
): boolean {
  return (member.attributes ?? []).some(
    (attr) =>
      attr.kind === "fieldAttribute" && attr.path.value[0] === "updatedAt",
  );
}

export { prismaReader };
