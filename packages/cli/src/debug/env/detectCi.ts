import { isCI } from "ci-info";

const detectCi = (): boolean => isCI;

export { detectCi };
