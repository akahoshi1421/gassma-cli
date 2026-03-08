import {
  parsePrismaSchema,
  findFirstAttribute,
} from "@loancrate/prisma-schema-parser";
import type { ModelDeclaration } from "@loancrate/prisma-schema-parser";
import { detectImplicitManyToMany } from "./detectImplicitManyToMany";
import {
  getRelationName,
  getFieldReferences,
  getActionValue,
  findInverseField,
  isOneToOneRelation,
} from "./relationHelpers";
import type { FieldsideRelation } from "./relationHelpers";

type ThroughDefinition = {
  sheet: string;
  field: string;
  reference: string;
};

type RelationDefinition = {
  type: "oneToMany" | "oneToOne" | "manyToOne" | "manyToMany";
  to: string;
  field: string;
  reference: string;
  onDelete?: string;
  onUpdate?: string;
  through?: ThroughDefinition;
};

type RelationsConfig = {
  [sheetName: string]: {
    [relationName: string]: RelationDefinition;
  };
};

const collectFieldsideRelations = (
  models: ModelDeclaration[],
): FieldsideRelation[] => {
  const relations: FieldsideRelation[] = [];

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

      relations.push({
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

  return relations;
};

const buildRelationsConfig = (
  fieldsideRelations: FieldsideRelation[],
  models: ModelDeclaration[],
): RelationsConfig => {
  const result: RelationsConfig = {};

  fieldsideRelations.forEach((rel) => {
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
      ...(rel.onDelete ? { onDelete: rel.onDelete } : {}),
      ...(rel.onUpdate ? { onUpdate: rel.onUpdate } : {}),
    };
  });

  return result;
};

const extractRelations = (schemaText: string): RelationsConfig => {
  const ast = parsePrismaSchema(schemaText);

  const models = ast.declarations.filter(
    (d): d is ModelDeclaration => d.kind === "model",
  );

  const fieldsideRelations = collectFieldsideRelations(models);
  const result = buildRelationsConfig(fieldsideRelations, models);

  detectImplicitManyToMany(models, result);

  return result;
};

export { extractRelations };
export type { RelationsConfig, RelationDefinition };
