import { GassmaClient } from "../__generated__/client";

declare const lock: GoogleAppsScript.Lock.Lock;

// lock は省略できる
{
  new GassmaClient();
  new GassmaClient({ id: "sheet-id" });
}

// 利用者のスクリプトで取得した Lock を渡せる
{
  new GassmaClient({ lock });
  new GassmaClient({ id: "sheet-id", lock });
}

// Lock でない値は拒否される
{
  // @ts-expect-error lock は GoogleAppsScript.Lock.Lock のみ
  new GassmaClient({ lock: "script" });
}
