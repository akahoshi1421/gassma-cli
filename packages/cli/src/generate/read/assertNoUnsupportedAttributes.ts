import {
  type BlockAttribute,
  type FieldDeclaration,
  type ModelDeclaration,
  parsePrismaSchema,
  type SchemaArgument,
  type SchemaExpression,
} from "@loancrate/prisma-schema-parser";
import {
  UnsupportedAttributeError,
  type UnsupportedAttributeViolation,
} from "../../error/mainError";

const UNIQUENESS_REASON =
  "GASsma cannot enforce uniqueness on a spreadsheet.\n" +
  "Remove it, or check uniqueness in your code.";

const NATIVE_TYPE_REASON =
  "GASsma cannot control how a spreadsheet stores a value, so the native type has no effect.\n" +
  "Remove it.";

const fieldAttributeReasons = new Map<string, string>([
  ["unique", UNIQUENESS_REASON],
]);

const blockAttributeReasons = new Map<string, string>([
  ["unique", UNIQUENESS_REASON],
  [
    "id",
    "GASsma cannot declare a composite primary key on a spreadsheet.\n" +
      "Give the model a single `@id` field instead; a many-to-many relation needs no join model, because GASsma generates the through sheet for you.",
  ],
  [
    "index",
    "GASsma cannot create an index on a spreadsheet.\n" +
      "Remove it; every query reads the whole sheet either way.",
  ],
  [
    "fulltext",
    "GASsma cannot create a full-text index on a spreadsheet.\n" +
      "Remove it; every query reads the whole sheet either way.",
  ],
]);

const fieldListOf = (args: SchemaArgument[]): SchemaExpression[] => {
  const arrays = args.flatMap((arg) => {
    if (arg.kind === "array") return [arg];
    if (arg.kind !== "namedArgument" || arg.name.value !== "fields") return [];
    return arg.expression.kind === "array" ? [arg.expression] : [];
  });
  return arrays.length === 0 ? [] : arrays[0].items;
};

const fieldNameOf = (item: SchemaExpression): string[] => {
  if (item.kind === "path") return [item.value.join(".")];
  if (item.kind === "functionCall") return [item.path.value.join(".")];
  return [];
};

const blockTargetOf = (
  modelName: string,
  attribute: BlockAttribute,
): string => {
  const fields = fieldListOf(attribute.args ?? []).flatMap(fieldNameOf);
  return fields.length === 0
    ? modelName
    : `${modelName} (${fields.join(", ")})`;
};

const violationsOfField = (
  modelName: string,
  field: FieldDeclaration,
): UnsupportedAttributeViolation[] =>
  (field.attributes ?? []).flatMap((attribute) => {
    const path = attribute.path.value;
    const target = `${modelName}.${field.name.value}`;
    if (path.length > 1)
      return [
        { attribute: `@${path.join(".")}`, target, reason: NATIVE_TYPE_REASON },
      ];
    const reason = fieldAttributeReasons.get(path[0]);
    return reason ? [{ attribute: `@${path[0]}`, target, reason }] : [];
  });

const violationsOfBlockAttribute = (
  modelName: string,
  attribute: BlockAttribute,
): UnsupportedAttributeViolation[] => {
  const name = attribute.path.value.join(".");
  const reason = blockAttributeReasons.get(name);
  return reason
    ? [
        {
          attribute: `@@${name}`,
          target: blockTargetOf(modelName, attribute),
          reason,
        },
      ]
    : [];
};

const violationsOfModel = (
  model: ModelDeclaration,
): UnsupportedAttributeViolation[] => {
  const modelName = model.name.value;
  return model.members.flatMap((member) => {
    if (member.kind === "field") return violationsOfField(modelName, member);
    if (member.kind === "blockAttribute")
      return violationsOfBlockAttribute(modelName, member);
    return [];
  });
};

const collectUnsupportedAttributes = (
  schemaText: string,
): UnsupportedAttributeViolation[] => {
  const ast = parsePrismaSchema(schemaText);
  return ast.declarations.flatMap((decl) =>
    decl.kind === "model" ? violationsOfModel(decl) : [],
  );
};

const assertNoUnsupportedAttributes = (schemaText: string): void => {
  const violations = collectUnsupportedAttributes(schemaText);
  if (violations.length === 0) return;
  throw new UnsupportedAttributeError(violations);
};

export { assertNoUnsupportedAttributes, collectUnsupportedAttributes };
