export const idField = <T>(): { id: T } => {
  return null as any;
};

type StrictDesc<
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends HasManyDesc,
  TKey,
> = {
  name: TName;
  key: TKey;
  fields: TFields;
  hasMany: THasMany;
};

export type ModelDesc<
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends HasManyDesc,
  TKey,
> = {
  name: TName;
  key: TKey;
  fields: TFields;
  hasMany: THasMany;
} & (TName & {});

// don't ask me why the TName works... but it does, otherwise circular references do not work...

export type AnyDesc = ModelDesc<any, any, any, any>;
export type StrictAnyDesc = StrictDesc<any, any, any, any>;

type FieldEntry = "string" | { id: string } | BelongsTo<any, any, any>;
type FieldDesc = Record<string, FieldEntry>;

export type HasManyEntry<TGetModel extends () => AnyDesc> = {
  getModel: TGetModel;
  isSingleton: false;
};

type HasOneOpts = {
  force: boolean;
};

export type HasOneEntry<
  TGetModel extends () => AnyDesc,
  Opts extends HasOneOpts,
> = {
  getModel: TGetModel;
  isSingleton: true;
  options: Opts;
};
type HasManyDesc = Record<string, HasManyEntry<any> | HasOneEntry<any, any>>;

type SetKey<
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends HasManyDesc,
> = {
  key: <TKey extends keyof TFields>(
    key: TKey,
  ) => ModelDesc<TName, TFields, THasMany, TKey>;
  compoundKey: <K1 extends keyof TFields, K2 extends keyof TFields>(
    k1: K1,
    k2: K2,
  ) => ModelDesc<TName, TFields, THasMany, [K1, K2]>;
};

type SetHasMany<TName extends string, TFields extends FieldDesc> = {
  hasMany: <THasMany extends HasManyDesc>(
    hasMany: THasMany,
  ) => SetKey<TName, TFields, THasMany>;
};

type SetFields<TName extends string> = {
  fields: <const TFields extends FieldDesc>(
    fieldSchema: TFields,
  ) => SetHasMany<TName, TFields>;
};

export const makeModel = <N extends string>(name: N): SetFields<N> => {
  return null as any;
};

export const makeRoot = <N extends string, TMany extends HasManyDesc>(
  name: N,
  hasMany: TMany,
): ModelDesc<N, {}, TMany, never> => {
  return null as any;
};

export const hasOne = <T extends () => StrictAnyDesc, Opts extends HasOneOpts>(
  getModel: T,
  options?: Partial<Opts>,
): HasOneEntry<T, { force: Opts["force"] }> => {
  return {
    getModel,
    isSingleton: true,
    options: { force: options?.force ?? false },
  };
};

export const hasMany = <T extends () => StrictAnyDesc>(
  getModel: T,
): HasManyEntry<T> => {
  return { getModel, isSingleton: false };
};

type BelongsToOpts = {
  optional: boolean;
};

export type BelongsTo<
  TRel extends string,
  TModelGetter extends () => AnyDesc,
  Opts extends BelongsToOpts,
> = {
  relName: TRel;
  getModel: TModelGetter;
  options: Opts;
};

export const belongsTo = <
  TRel extends string,
  TModelGetter extends () => AnyDesc,
  Opts extends BelongsToOpts,
>(
  relName: TRel,
  getModel: TModelGetter,
  options?: Partial<Opts>,
): BelongsTo<TRel, TModelGetter, { optional: Opts["optional"] }> => {
  return {
    relName,
    getModel,
    options: { optional: options?.optional ?? false },
  };
};

export type InferFieldType<T extends FieldEntry> = T extends "string"
  ? string
  : T extends { id: infer X }
    ? X
    : T extends BelongsTo<
          any,
          () => StrictDesc<any, infer F, any, infer K>,
          any
        >
      ? K extends keyof F
        ? InferFieldType<F[K]>
        : never
      : never;
