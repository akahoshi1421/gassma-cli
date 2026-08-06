import vm from "vm";

const EXECUTION_TIMEOUT_MS = 1000;

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

const toSheetNames = (definitions: unknown): string[] | undefined => {
  if (!Array.isArray(definitions) || definitions.length === 0) return undefined;

  const names: string[] = [];
  const valid = definitions.every((definition) => {
    if (!isRecord(definition)) return false;
    const models = definition.models;
    if (!Array.isArray(models)) return false;
    return models.every((model) => {
      if (!isRecord(model) || typeof model.name !== "string") return false;
      names.push(model.name);
      return true;
    });
  });

  return valid ? names : undefined;
};

const readTrailSheetNames = (content: string): string[] | undefined => {
  try {
    return toSheetNames(runTrail(content));
  } catch {
    return undefined;
  }
};

export { readTrailSheetNames };
