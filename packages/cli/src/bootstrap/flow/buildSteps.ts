import type { BootstrapStep } from "./context";
import {
  installPromptStep,
  linterStep,
  sampleStep,
  sheetsStep,
  styleStep,
  titleStep,
} from "./steps/askSteps";
import { claspCreateStep, manifestStep } from "./steps/claspSteps";
import { directoryStep } from "./steps/directoryStep";
import { installRunStep, nextStepsStep } from "./steps/finishSteps";
import {
  initStep,
  projectFilesStep,
  sampleIndexStep,
} from "./steps/writeSteps";

// Future questions are added by inserting a step here.
const buildBootstrapSteps = (): BootstrapStep[] => [
  directoryStep,
  titleStep,
  sheetsStep,
  claspCreateStep,
  manifestStep,
  styleStep,
  linterStep,
  sampleStep,
  installPromptStep,
  projectFilesStep,
  sampleIndexStep,
  initStep,
  installRunStep,
  nextStepsStep,
];

export { buildBootstrapSteps };
