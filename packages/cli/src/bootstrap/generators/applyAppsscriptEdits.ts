import { GASSMA_LIBRARY } from "../const/gassmaLibrary";
import { isRecord } from "../util/isRecord";

type AppsscriptEditOptions = {
  timeZone: string;
};

const hasGassmaLibrary = (libraries: unknown[]): boolean =>
  libraries.some(
    (library) =>
      isRecord(library) && library.libraryId === GASSMA_LIBRARY.scriptId,
  );

const buildLibraries = (libraries: unknown[]): unknown[] => {
  if (hasGassmaLibrary(libraries)) return libraries;

  return [
    ...libraries,
    {
      userSymbol: GASSMA_LIBRARY.userSymbol,
      libraryId: GASSMA_LIBRARY.scriptId,
      version: GASSMA_LIBRARY.version,
      developmentMode: false,
    },
  ];
};

const applyAppsscriptEdits = (
  manifest: unknown,
  options: AppsscriptEditOptions,
): Record<string, unknown> => {
  const base = isRecord(manifest) ? manifest : {};
  const dependencies = isRecord(base.dependencies) ? base.dependencies : {};
  const libraries = Array.isArray(dependencies.libraries)
    ? dependencies.libraries
    : [];

  return {
    ...base,
    timeZone: options.timeZone,
    dependencies: {
      ...dependencies,
      libraries: buildLibraries(libraries),
    },
    exceptionLogging:
      typeof base.exceptionLogging === "string"
        ? base.exceptionLogging
        : "STACKDRIVER",
    runtimeVersion:
      typeof base.runtimeVersion === "string" ? base.runtimeVersion : "V8",
  };
};

export { applyAppsscriptEdits };
export type { AppsscriptEditOptions };
