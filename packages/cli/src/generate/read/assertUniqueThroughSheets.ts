import { ThroughSheetConflictError } from "../../error/mainError";
import type { RelationsConfig } from "./extractRelations";

const toPairLabel = (from: string, to: string): string =>
  [from, to].sort().join(" <-> ");

const assertUniqueThroughSheets = (relations: RelationsConfig): void => {
  const pairBySheet = new Map<string, string>();

  Object.keys(relations).forEach((modelName) => {
    Object.values(relations[modelName]).forEach((definition) => {
      const through = definition.through;
      if (through === undefined) return;

      const pair = toPairLabel(modelName, definition.to);
      const known = pairBySheet.get(through.sheet);
      if (known !== undefined && known !== pair)
        throw new ThroughSheetConflictError(through.sheet, known, pair);

      pairBySheet.set(through.sheet, pair);
    });
  });
};

export { assertUniqueThroughSheets };
