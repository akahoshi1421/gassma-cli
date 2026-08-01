import { STUB_FILE_NAME } from "./generateMigrationStub";

const printNextSteps = (
  stubPath: string,
  headline: string,
  acceptDataLoss: boolean,
): void => {
  console.log(`\n${headline}\n`);
  if (acceptDataLoss)
    console.log(
      "⚠️ This migration deletes sheets and columns that are not in the schema.\n",
    );
  console.log("Next steps:");
  console.log(`  1. Run "clasp push" (or "npm run push") to upload ${STUB_FILE_NAME}
  2. In the Apps Script editor, run the "gassmaMigrate" function once`);
  console.log(
    '\nNote: push with "clasp push" directly. A full clean build (e.g. "npm run deploy")' +
      ` may wipe the output directory and delete ${stubPath} before it is pushed.`,
  );
};

export { printNextSteps };
