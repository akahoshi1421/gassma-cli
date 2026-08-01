import { IgnoredRelationColumnError } from "../../error/mainError";
import type { IgnoreConfig } from "./extractIgnore";
import type { RelationsConfig } from "./extractRelations";

type IgnoredRelationColumn = {
  model: string;
  column: string;
  relation: string;
};

const describeViolation = (violation: IgnoredRelationColumn): string =>
  `The relation "${violation.relation}" runs on the column "${violation.column}" of model "${violation.model}", which is marked @ignore. ` +
  "GASsma drops @ignore columns from query conditions, so relation actions (onDelete / onUpdate) and nested writes lose the filter " +
  "that narrows target rows and can rewrite or delete every row of the related sheet. " +
  `Remove @ignore from "${violation.model}.${violation.column}", or remove the relation from the schema.`;

const collectViolations = (
  relations: RelationsConfig,
  ignore: IgnoreConfig,
): IgnoredRelationColumn[] => {
  const violations: IgnoredRelationColumn[] = [];
  const seen = new Set<string>();

  const record = (model: string, column: string, relation: string): void => {
    if (!ignore[model]?.includes(column)) return;
    const key = `${model}.${column}`;
    if (seen.has(key)) return;
    seen.add(key);
    violations.push({ model, column, relation });
  };

  Object.keys(relations).forEach((modelName) => {
    Object.keys(relations[modelName]).forEach((relationName) => {
      const definition = relations[modelName][relationName];
      const relation = `${modelName}.${relationName}`;
      record(modelName, definition.field, relation);
      record(definition.to, definition.reference, relation);
    });
  });

  return violations;
};

const assertNoIgnoredRelationColumns = (
  relations: RelationsConfig,
  ignore: IgnoreConfig,
): void => {
  const violations = collectViolations(relations, ignore);
  if (violations.length === 0) return;
  throw new IgnoredRelationColumnError(violations.map(describeViolation));
};

export { assertNoIgnoredRelationColumns };
