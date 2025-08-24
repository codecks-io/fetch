import type { Nominal } from "./_type-helpers";

type TypedField<K extends string, X, Opts extends BaseOpts = {}> = {
  type: K;
  _: [X, Opts];
};

export const id = <T extends string>() => {
  return { type: "id" } as TypedField<"id", T>;
};

export const string = <Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "string" } as TypedField<"string", string, Opts>;
};

export const int = <Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "int" } as TypedField<"int", number, Opts>;
};

export const bool = <Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "bool" } as TypedField<"bool", boolean, Opts>;
};

export const date = <Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "date" } as TypedField<"date", Date, Opts>;
};

export const day = <Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "day" } as TypedField<
    "day",
    { day: number; month: number; year: number },
    Opts
  >;
};

export const object = <T, Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "obj" } as TypedField<"obj", T, Opts>;
};

export const array = <T, Opts extends BaseOpts = {}>(opts?: Opts) => {
  return { type: "array" } as TypedField<"array", T[], Opts>;
};

type BelongsTo<
  RelName extends string,
  Id extends Nominal<any, any>,
  Opts extends BaseOpts = {},
> = TypedField<"belongsTo", Id, Opts> & { relName: RelName };

export const belongsTo = <
  T extends Nominal<any, any>,
  RelName extends string,
  Opts extends BaseOpts = {},
>(
  relName: RelName,
  opts?: Opts,
) => {
  return { type: "belongsTo", relName } as BelongsTo<RelName, T, Opts>;
};

type BaseOpts = { optional?: boolean };

export type SimpleFieldEntry = TypedField<string, any, any>;

export type InferSimpleFieldEntry<T extends SimpleFieldEntry> =
  T extends TypedField<any, infer X, infer Opts>
    ? Opts extends { optional: true }
      ? X | null
      : X
    : never;
