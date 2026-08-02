import { expectTypeOf } from "vitest";
import { Gassma } from "../__generated__/client";

// GassmaUnknownArgumentError は Gassma namespace から利用できる
{
  expectTypeOf<Gassma.GassmaUnknownArgumentError>().toExtend<Error>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaUnknownArgumentError>
  >().toEqualTypeOf<[argumentName: string, availableArguments: string[]]>();
}

// catch した unknown を instanceof で型判別できる
{
  const caught: unknown = null;
  if (caught instanceof Gassma.GassmaUnknownArgumentError) {
    expectTypeOf(caught).toEqualTypeOf<Gassma.GassmaUnknownArgumentError>();
    expectTypeOf(caught.message).toEqualTypeOf<string>();
    expectTypeOf(caught.name).toEqualTypeOf<string>();
  }
}
