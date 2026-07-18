import { GassmaConfigEnvError } from "../error/mainError";

type EnvKey<Env> = keyof {
  [K in keyof Env as Env[K] extends string | undefined ? K : never]: Env[K];
};

function env(name: string): string;
function env<Env>(name: EnvKey<Env> & string): string;
function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new GassmaConfigEnvError(name);
  }
  return value;
}

export { env };
