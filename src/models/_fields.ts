import type {Nominal} from "./_type-helpers";

export type TypedField<K extends string, X, Opts extends BaseOpts> = {
  type: K;
  _: [X, Opts];
};

export const id = <T extends string>() => {
  return {type: "id"} as TypedField<"id", T, {}>;
};

export const string = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "string"} as TypedField<"string", string, Opts>;
};

export const int = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "int"} as TypedField<"int", number, Opts>;
};

export const bigint = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "bigint"} as TypedField<"bigint", bigint, Opts>;
};

export const bool = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "bool"} as TypedField<"bool", boolean, Opts>;
};

export const date = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "date"} as TypedField<"date", Date, Opts>;
};

export const day = <const Opts extends BaseOpts>(opts: Opts) => {
  return {type: "day"} as TypedField<"day", {day: number; month: number; year: number}, Opts>;
};

export const object = <const Opts extends BaseOpts = {}>(opts: Opts) => {
  return {type: "obj"} as TypedField<"obj", any, Opts>;
};

export const array = <const Opts extends BaseOpts = {}>(opts: Opts) => {
  return {type: "array"} as TypedField<"array", any[], Opts>;
};

export const belongsTo = <const Opts extends BaseOpts>(opts: Opts) => {
  return {
    type: <TId extends Nominal<any, any>>(): TypedField<"belongsTo", TId, Opts> => {
      return {type: "belongsTo"} as TypedField<"belongsTo", TId, Opts>;
    },
  };
};

type BaseOpts = {optional?: boolean};

export type FieldEntry = TypedField<string, any, any>;

export type InferSimpleFieldEntry<T extends FieldEntry> =
  T extends TypedField<any, infer X, infer Opts>
    ? Opts extends {optional: true}
      ? X | null
      : X
    : never;
