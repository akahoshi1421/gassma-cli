import { expectTypeOf } from "vitest";
import { Gassma } from "../__generated__/client";

// GassmaInvalidValueError は Gassma namespace から利用できる
{
  expectTypeOf<Gassma.GassmaInvalidValueError>().toExtend<Error>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaInvalidValueError>
  >().toEqualTypeOf<[argumentName: string, expected: string]>();
}

// catch した unknown を instanceof で型判別できる
{
  const caught: unknown = null;
  if (caught instanceof Gassma.GassmaInvalidValueError) {
    expectTypeOf(caught).toEqualTypeOf<Gassma.GassmaInvalidValueError>();
    expectTypeOf(caught.message).toEqualTypeOf<string>();
    expectTypeOf(caught.name).toEqualTypeOf<string>();
  }
}
