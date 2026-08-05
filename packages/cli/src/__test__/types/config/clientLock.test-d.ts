import { Gassma, GassmaClient } from "../__generated__/client";

declare const lock: Gassma.Lock;

// GoogleAppsScript.Lock.Lock と同じ形。構造的に代入できることを確かめる
declare const gasLock: {
  hasLock(): boolean;
  releaseLock(): void;
  tryLock(timeoutInMillis: number): boolean;
  waitLock(timeoutInMillis: number): void;
};

// lock は省略できる
{
  new GassmaClient();
  new GassmaClient({ id: "sheet-id" });
}

// 利用者のスクリプトで取得した Lock を渡せる
{
  new GassmaClient({ lock });
  new GassmaClient({ id: "sheet-id", lock });
  new GassmaClient({ lock: gasLock });
}

// Lock でない値は拒否される
{
  // @ts-expect-error lock は Gassma.Lock のみ
  new GassmaClient({ lock: "script" });
}

declare const partialLock: { waitLock(timeoutInMillis: number): void };

// 形が足りない値も拒否される
{
  // @ts-expect-error releaseLock / hasLock がない
  new GassmaClient({ lock: partialLock });
}
