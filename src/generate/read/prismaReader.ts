import { parsePrismaSchema } from "@loancrate/prisma-schema-parser";
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
      const baseType =
        member.type.kind === "optional" || member.type.kind === "required"
          ? member.type.type
          : member.type;
      if (baseType.kind === "unsupported" || baseType.kind === "list") return;

      const typeName = baseType.name.value;
      const fieldName = isOptional
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

export { prismaReader };
