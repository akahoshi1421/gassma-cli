import { generateMigrationStub } from "../migrate/generateMigrationStub";
import type { MigrationStubOptions } from "../migrate/generateMigrationStub";
import { printNextSteps } from "../migrate/printNextSteps";

type DbPushOptions = MigrationStubOptions;

function dbPush(options?: DbPushOptions) {
  const stub = generateMigrationStub(options);
  printNextSteps(
    stub.stubPath,
    "✅ Sync script generated",
    stub.acceptDataLoss,
  );
}

export { dbPush };
export type { DbPushOptions };
