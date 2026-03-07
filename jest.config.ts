import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  roots: ["<rootDir>/src/__test__"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};

export default config;
