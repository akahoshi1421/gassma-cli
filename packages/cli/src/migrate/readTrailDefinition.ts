import vm from "vm";

const EXECUTION_TIMEOUT_MS = 1000;

type TrailModel = { name: string; columns: string[] };

type TrailDefinition = { acceptDataLoss: boolean; models: TrailModel[] };

const SETUP = `
globalThis.__gassmaCaptured = [];
globalThis.__gassmaStub = {
  migrateSheets: function (definition) {
    globalThis.__gassmaCaptured.push(definition);
  }
};
Object.setPrototypeOf(
  globalThis,
  new Proxy({}, { has: function () { return true; }, get: function () { return globalThis.__gassmaStub; } })
);
`;

const DRIVER = `
Object.keys(globalThis).forEach(function (key) {
  if (typeof globalThis[key] !== "function") return;
  try {
    globalThis[key]();
  } catch (error) {}
});
JSON.stringify(globalThis.__gassmaCaptured);
`;

const runTrail = (content: string): unknown => {
  const context = vm.createContext({});
  const options = { timeout: EXECUTION_TIMEOUT_MS };
  vm.runInContext(SETUP, context, options);
  vm.runInContext(content, context, options);
  const captured = vm.runInContext(DRIVER, context, options);
  return typeof captured === "string" ? JSON.parse(captured) : undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const toModel = (model: unknown): TrailModel | undefined => {
  if (!isRecord(model)) return undefined;
  if (typeof model.name !== "string") return undefined;
  if (!isStringArray(model.columns)) return undefined;
  return { name: model.name, columns: model.columns };
};

const toDefinition = (definitions: unknown): TrailDefinition | undefined => {
  if (!Array.isArray(definitions) || definitions.length === 0) return undefined;

  const models: TrailModel[] = [];
  let acceptDataLoss = false;
  const valid = definitions.every((definition) => {
    if (!isRecord(definition)) return false;
    if (definition.acceptDataLoss === true) acceptDataLoss = true;
    if (!Array.isArray(definition.models)) return false;
    return definition.models.every((entry) => {
      const model = toModel(entry);
      if (model === undefined) return false;
      models.push(model);
      return true;
    });
  });

  return valid ? { acceptDataLoss, models } : undefined;
};

const readTrailDefinition = (content: string): TrailDefinition | undefined => {
  try {
    return toDefinition(runTrail(content));
  } catch {
    return undefined;
  }
};

export { readTrailDefinition };
export type { TrailDefinition, TrailModel };
