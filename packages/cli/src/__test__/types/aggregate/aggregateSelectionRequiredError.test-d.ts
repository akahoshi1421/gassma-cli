import { expectTypeOf } from "vitest";
import { Gassma } from "../__generated__/client";

// GassmaAggregateSelectionRequiredError は Gassma namespace から利用できる
{
  expectTypeOf<Gassma.GassmaAggregateSelectionRequiredError>().toExtend<Error>();
  expectTypeOf<
    ConstructorParameters<typeof Gassma.GassmaAggregateSelectionRequiredError>
  >().toEqualTypeOf<[]>();
}

// catch した unknown を instanceof で型判別できる
{
  const caught: unknown = null;
  if (caught instanceof Gassma.GassmaAggregateSelectionRequiredError) {
    expectTypeOf(
      caught,
    ).toEqualTypeOf<Gassma.GassmaAggregateSelectionRequiredError>();
    expectTypeOf(caught.message).toEqualTypeOf<string>();
    expectTypeOf(caught.name).toEqualTypeOf<string>();
  }
}
