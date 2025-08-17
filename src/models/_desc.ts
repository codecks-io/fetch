import type { InferSimpleFieldEntry, SimpleFieldEntry } from "./_fields";

type StrictDesc<
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends HasManyDesc,
  TKey extends string[],
> = {
  name: TName;
  keys: TKey;
  fields: TFields;
  hasMany: THasMany;
  belongsToMap: Record<string, string>;
};

export type ModelDesc<
  TName extends string,
  TFields extends FieldDesc,
  THasMany extends HasManyDesc,
  TKey extends string[],
> = {
  name: TName;
  keys: TKey;
  fields: TFields;
  hasMany: THasMany;
  belongsToMap: Record<string, string>;
} & (TName & {});

// don't ask me why the TName works... but it does, otherwise circular references do not work...

export type AnyDesc = ModelDesc<any, any, any, any[]>;
export type StrictAnyDesc = StrictDesc<any, any, any, any[]>;

export type FieldEntry = SimpleFieldEntry | BelongsTo<any, any, any>;
export type FieldDesc = Record<string, FieldEntry>;

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
  key: <TKey extends keyof TFields & string>(
    key: TKey,
  ) => ModelDesc<TName, TFields, THasMany, [TKey]>;
  compoundKey: <
    K1 extends keyof TFields & string,
    K2 extends keyof TFields & string,
  >(
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
  const m: StrictAnyDesc = {
    name,
    fields: {},
    hasMany: {},
    keys: [] as any[],
    belongsToMap: {},
  };

  const setKey: SetKey<any, any, any> = {
    key: (key) => {
      m.keys = [key];
      return m as any;
    },
    compoundKey: (k1, k2) => {
      m.keys = [k1, k2];
      return m as any;
    },
  };

  const setHasMany: SetHasMany<any, any> = {
    hasMany: (hasMany: any) => {
      m.hasMany = hasMany;
      return setKey;
    },
  };

  return {
    fields: (fields) => {
      m.fields = fields;
      Object.entries(fields).forEach(([k, v]) => {
        if (v.type === "belongsTo") {
          m.belongsToMap[v.relName] = k;
        }
      });
      return setHasMany;
    },
  };
};

export const makeRoot = <N extends string, TMany extends HasManyDesc>(
  name: N,
  hasMany: TMany,
): ModelDesc<N, {}, TMany, []> => {
  const m: StrictAnyDesc = {
    name,
    fields: {},
    hasMany: hasMany,
    keys: [],
    belongsToMap: {},
  };
  return m as any;
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
  type: "belongsTo";
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
    type: "belongsTo",
    relName,
    getModel,
    options: { optional: options?.optional ?? false },
  };
};

export type InferFieldType<T extends FieldEntry> = T extends {
  type: "belongsTo";
  value: BelongsTo<any, () => StrictDesc<any, infer F, any, infer K>, any>;
}
  ? K extends keyof F
    ? InferFieldType<F[K]>
    : never
  : T extends SimpleFieldEntry
    ? InferSimpleFieldEntry<T>
    : never;
