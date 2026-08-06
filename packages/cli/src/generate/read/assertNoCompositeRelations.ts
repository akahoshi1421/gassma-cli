import {
  findArgument,
  findFirstAttribute,
  type FieldDeclaration,
  type ModelDeclaration,
  parsePrismaSchema,
  type SchemaArgument,
  type SchemaExpression,
} from "@loancrate/prisma-schema-parser";
import {
  CompositeRelationError,
  type CompositeRelationViolation,
} from "../../error/mainError";

const COMPOSITE_RELATION_REASON =
  "GASsma matches a relation on a single column for now, so the columns after the first are dropped and rows that agree on the first column alone would match.\n" +
  "Please narrow the relation to one column until composite keys are supported.";

const argumentItems = (
  args: readonly SchemaArgument[] | undefined,
  name: string,
): SchemaExpression[] => {
  const arg = findArgument(args, name);
  if (!arg) return [];
  return arg.expression.kind === "array" ? arg.expression.items : [];
};

const columnNameOf = (item: SchemaExpression): string[] => {
  if (item.kind === "path") return [item.value.join(".")];
  if (item.kind === "functionCall") return [item.path.value.join(".")];
  return [];
};

const describeColumns = (
  fields: SchemaExpression[],
  references: SchemaExpression[],
): string =>
  `fields: [${fields.flatMap(columnNameOf).join(", ")}], ` +
  `references: [${references.flatMap(columnNameOf).join(", ")}]`;

const violationsOfField = (
  modelName: string,
  field: FieldDeclaration,
): CompositeRelationViolation[] => {
  const attribute = findFirstAttribute(field.attributes, "relation");
  if (!attribute) return [];

  const fields = argumentItems(attribute.args, "fields");
  const references = argumentItems(attribute.args, "references");
  if (fields.length < 2 && references.length < 2) return [];

  return [
    {
      target: `${modelName}.${field.name.value}`,
      columns: describeColumns(fields, references),
      reason: COMPOSITE_RELATION_REASON,
    },
  ];
};

const violationsOfModel = (
  model: ModelDeclaration,
): CompositeRelationViolation[] =>
  model.members.flatMap((member) =>
    member.kind === "field" ? violationsOfField(model.name.value, member) : [],
  );

const collectCompositeRelations = (
  schemaText: string,
): CompositeRelationViolation[] => {
  const ast = parsePrismaSchema(schemaText);
  return ast.declarations.flatMap((decl) =>
    decl.kind === "model" ? violationsOfModel(decl) : [],
  );
};

const assertNoCompositeRelations = (schemaText: string): void => {
  const violations = collectCompositeRelations(schemaText);
  if (violations.length === 0) return;
  throw new CompositeRelationError(violations);
};

export { assertNoCompositeRelations, collectCompositeRelations };
