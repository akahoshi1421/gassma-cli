import {
  parsePrismaSchema,
  findFirstAttribute,
  findArgument,
} from "@loancrate/prisma-schema-parser";
import type {
  ModelDeclaration,
  FieldDeclaration,
  SchemaArgument,
} from "@loancrate/prisma-schema-parser";

type RelationDefinition = {
  type: "oneToMany" | "oneToOne" | "manyToOne" | "manyToMany";
  to: string;
  field: string;
  reference: string;
  onDelete?: string;
  onUpdate?: string;
};

type RelationsConfig = {
  [sheetName: string]: {
    [relationName: string]: RelationDefinition;
  };
};

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

const extractRelations = (schemaText: string): RelationsConfig => {
  const ast = parsePrismaSchema(schemaText);

  const models = ast.declarations.filter(
    (d): d is ModelDeclaration => d.kind === "model",
  );

  const fieldsideRelations: FieldsideRelation[] = [];

  models.forEach((model) => {
    model.members.forEach((member) => {
      if (member.kind !== "field") return;

      const attr = findFirstAttribute(member.attributes, "relation");
      if (!attr) return;

      const fields = getFieldReferences(attr.args, "fields");
      const references = getFieldReferences(attr.args, "references");
      if (!fields || !references) return;

      const baseType =
        member.type.kind === "optional" ? member.type.type : member.type;
      if (baseType.kind !== "typeId") return;

      fieldsideRelations.push({
        modelName: model.name.value,
        fieldName: member.name.value,
        toModel: baseType.name.value,
        localField: fields[0],
        foreignField: references[0],
        isOptional: member.type.kind === "optional",
        relationName: getRelationName(member),
        onDelete: getActionValue(attr.args, "onDelete"),
        onUpdate: getActionValue(attr.args, "onUpdate"),
      });
    });
  });

  const result: RelationsConfig = {};

  fieldsideRelations.forEach((rel) => {
    // The side with @relation(fields, references) - many side or owning oneToOne
    if (!result[rel.modelName]) result[rel.modelName] = {};

    const isOneToOne = isOneToOneRelation(rel, models);
    result[rel.modelName][rel.fieldName] = {
      type: isOneToOne ? "oneToOne" : "manyToOne",
      to: rel.toModel,
      field: rel.localField,
      reference: rel.foreignField,
      ...(rel.onDelete ? { onDelete: rel.onDelete } : {}),
      ...(rel.onUpdate ? { onUpdate: rel.onUpdate } : {}),
    };

    // The inverse side
    const inverseModel = models.find((m) => m.name.value === rel.toModel);
    if (!inverseModel) return;

    const inverseField = findInverseField(
      inverseModel,
      rel.modelName,
      rel.relationName,
    );
    if (!inverseField) return;

    if (!result[rel.toModel]) result[rel.toModel] = {};
    const inverseIsListType = inverseField.type.kind === "list";

    result[rel.toModel][inverseField.name.value] = {
      type: inverseIsListType ? "oneToMany" : "oneToOne",
      to: rel.modelName,
      field: rel.foreignField,
      reference: rel.localField,
    };
  });

  return result;
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

    // If relation has a name, match it
    if (relationName) {
      return getRelationName(m) === relationName;
    }

    // No @relation(fields:...) means it's the inverse side
    const attr = findFirstAttribute(m.attributes, "relation");
    if (!attr) return true;
    const fields = getFieldReferences(attr.args, "fields");
    return fields === null;
  });
};

export { extractRelations };
export type { RelationsConfig, RelationDefinition };
