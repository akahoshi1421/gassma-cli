import type {
  FieldDeclaration,
  PrismaSchema,
} from "@loancrate/prisma-schema-parser";

const isScalarField = (
  field: FieldDeclaration,
  schema: PrismaSchema,
): boolean => {
  // List types (e.g. Post[]) are relation fields
  if (field.type.kind === "list") return false;

  const baseType =
    field.type.kind === "optional" || field.type.kind === "required"
      ? field.type.type
      : field.type;

  if (baseType.kind === "unsupported") return false;

  const typeName = baseType.name.value;

  // Check if the type references another model in the schema
  const isModelReference = schema.declarations.some(
    (decl) => decl.kind === "model" && decl.name.value === typeName,
  );

  return !isModelReference;
};

export { isScalarField };
