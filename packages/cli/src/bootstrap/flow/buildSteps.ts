import type { BootstrapStep } from "./context";
import {
  installPromptStep,
  sampleStep,
  sheetsStep,
  styleStep,
  titleStep,
} from "./steps/askSteps";
import { claspCreateStep, manifestStep } from "./steps/claspSteps";
import { installRunStep, nextStepsStep } from "./steps/finishSteps";
import {
  initStep,
  projectFilesStep,
  sampleIndexStep,
} from "./steps/writeSteps";

// Future questions (e.g. linter selection) are added by inserting a step here.
const buildBootstrapSteps = (): BootstrapStep[] => [
  titleStep,
  sheetsStep,
  claspCreateStep,
  manifestStep,
  styleStep,
  sampleStep,
  installPromptStep,
  projectFilesStep,
  sampleIndexStep,
  initStep,
  installRunStep,
  nextStepsStep,
];

export { buildBootstrapSteps };
