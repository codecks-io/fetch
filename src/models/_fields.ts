import type {Nominal} from "./_type-helpers";

export type TypedField<K extends string, X, Opts extends BaseOpts> = {
  type: K;
  _: [X, Opts];
};

export const id = <T extends string>() => {
  return {type: "id"} as TypedField<"id", T, {}>;
};

const withOpts = <T>(type: string, opts: BaseOpts): T =>
  (opts.optional ? {type, optional: true} : {type}) as T;

export const string = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"string", string, Opts>>("string", opts);
};

export const int = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"int", number, Opts>>("int", opts);
};

export const bigint = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"bigint", bigint, Opts>>("bigint", opts);
};

export const bool = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"bool", boolean, Opts>>("bool", opts);
};

export const date = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"date", Date, Opts>>("date", opts);
};

export const day = <const Opts extends BaseOpts>(opts: Opts) => {
  return withOpts<TypedField<"day", {day: number; month: number; year: number}, Opts>>("day", opts);
};

export const object = <const Opts extends BaseOpts = {}>(opts: Opts) => {
  return withOpts<TypedField<"obj", any, Opts>>("obj", opts);
};

export const array = <const Opts extends BaseOpts = {}>(opts: Opts) => {
  return withOpts<TypedField<"array", any[], Opts>>("array", opts);
};

export const belongsTo = <const Opts extends BaseOpts>(opts: Opts) => {
  return {
    type: <TId extends Nominal<any, any>>(): TypedField<"belongsTo", TId, Opts> => {
      return withOpts<TypedField<"belongsTo", TId, Opts>>("belongsTo", opts);
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
