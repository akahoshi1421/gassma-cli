import {
  findFirstAttribute,
  findArgument,
} from "@loancrate/prisma-schema-parser";
import type {
  ModelDeclaration,
  FieldDeclaration,
  SchemaArgument,
} from "@loancrate/prisma-schema-parser";

type FieldsideRelation = {
  modelName: string;
  fieldName: string;
  toModel: string;
  localField: string;
  foreignField: string;
  isOptional: boolean;
  relationName: string | null;
  onDelete?: string;
  onUpdate?: string;
};

const getRelationName = (field: FieldDeclaration): string | null => {
  const attr = findFirstAttribute(field.attributes, "relation");
  if (!attr) return null;
  const firstArg = attr.args?.[0];
  if (!firstArg) return null;
  if ("kind" in firstArg && firstArg.kind !== "namedArgument") {
    if (firstArg.kind === "literal" && typeof firstArg.value === "string")
      return firstArg.value;
  }
  return null;
};

const getFieldReferences = (
  args: readonly SchemaArgument[] | undefined,
  name: string,
): string[] | null => {
  const arg = findArgument(args, name);
  if (!arg) return null;
  const expr = arg.expression;
  if (expr.kind === "array") {
    return expr.items
      .filter((item) => item.kind === "path")
      .map((item) => (item.kind === "path" ? item.value[0] : ""));
  }
  return null;
};

const getActionValue = (
  args: readonly SchemaArgument[] | undefined,
  name: string,
): string | undefined => {
  const arg = findArgument(args, name);
  if (!arg) return undefined;
  const expr = arg.expression;
  if (expr.kind === "path") return expr.value[0];
  return undefined;
};

const findInverseField = (
  model: ModelDeclaration,
  targetModelName: string,
  relationName: string | null,
): FieldDeclaration | undefined => {
  return model.members.find((m): m is FieldDeclaration => {
    if (m.kind !== "field") return false;

    const baseType =
      m.type.kind === "list" || m.type.kind === "optional"
        ? m.type.type
        : m.type;
    if (baseType.kind !== "typeId") return false;
    if (baseType.name.value !== targetModelName) return false;

    if (relationName) {
      if (getRelationName(m) !== relationName) return false;
      const relAttr = findFirstAttribute(m.attributes, "relation");
      if (relAttr) {
        const relFields = getFieldReferences(relAttr.args, "fields");
        if (relFields) return false;
      }
      return true;
    }

    const attr = findFirstAttribute(m.attributes, "relation");
    if (!attr) return true;
    const fields = getFieldReferences(attr.args, "fields");
    return fields === null;
  });
};

const isOneToOneRelation = (
  rel: FieldsideRelation,
  models: ModelDeclaration[],
): boolean => {
  const targetModel = models.find((m) => m.name.value === rel.toModel);
  if (!targetModel) return false;

  const inverseField = findInverseField(
    targetModel,
    rel.modelName,
    rel.relationName,
  );
  if (!inverseField) return false;

  return inverseField.type.kind !== "list";
};

export {
  getRelationName,
  getFieldReferences,
  getActionValue,
  findInverseField,
  isOneToOneRelation,
};
export type { FieldsideRelation };
