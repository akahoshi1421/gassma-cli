import type { MigrateModelDefinition } from "./buildMigrateModels";
import type { TrailDefinition } from "./readTrailDefinition";

type Drop =
  | { kind: "sheet"; sheet: string }
  | { kind: "column"; sheet: string; column: string };

const findDrops = (
  recorded: TrailDefinition,
  models: MigrateModelDefinition[],
): Drop[] => {
  const current = new Map(models.map((model) => [model.name, model.columns]));

  return recorded.models.flatMap((model): Drop[] => {
    const columns = current.get(model.name);
    if (columns === undefined) return [{ kind: "sheet", sheet: model.name }];

    const kept = new Set(columns);
    return model.columns
      .filter((column) => !kept.has(column))
      .map((column) => ({ kind: "column", sheet: model.name, column }));
  });
};

export { findDrops };
export type { Drop };
