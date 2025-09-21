import type {Filter, Order} from "./has-many-filter-type";
import type {InferFieldType, AnyDesc, RelationEntry, BelongsToOpts} from "./models/_desc";
import type {TypedField} from "./models/_fields";
import type {FilterNeverKeys} from "./models/_type-helpers";

type ModelMap = Record<string, AnyDesc>;

export interface ModelQuery<T extends AnyDesc, TMap extends ModelMap> {
  fields?: (keyof T["fields"])[];
  relations?: RelQuery<T, TMap>;
}

interface SimpleHasManyQuery<T extends AnyDesc, TMap extends ModelMap> extends ModelQuery<T, TMap> {
  type?: "query";
  orderBy?: Order<T>;
  limit?: number;
  offset?: number;
  filter?: Filter<T, TMap>;
  as?: string;
}

interface CountOrExistQuery<T extends AnyDesc, TMap extends ModelMap> {
  type: "count" | "exists";
  filter?: Filter<T, TMap>;
  as: string;
  fields?: never;
  relations?: never;
}

interface FirstOrLastQuery<T extends AnyDesc, TMap extends ModelMap> extends ModelQuery<T, TMap> {
  type: "first";
  filter?: Filter<T, TMap>;
  as: string;
  orderBy: Order<T>;
}

export type HasManyQuery<T extends AnyDesc, TMap extends ModelMap> =
  | SimpleHasManyQuery<T, TMap>
  | CountOrExistQuery<T, TMap>
  | FirstOrLastQuery<T, TMap>;

type AbstractHasManyQuery =
  | (ModelQuery<any, any> & {
      type?: "query" | "first";
      as?: string;
    })
  | {type: "count" | "exists"; as: string};

type HasManyQueryWithAs<T extends AnyDesc, TMap extends ModelMap> = HasManyQuery<T, TMap> & {
  as: string;
};

type HasManyRelQueryEntry<
  T extends AnyDesc,
  TMap extends ModelMap,
  K extends keyof ExtractHasMany<T, TMap>,
> =
  | HasManyQuery<TMap[T["relations"][K]["relName"]], TMap>
  | HasManyQueryWithAs<TMap[T["relations"][K]["relName"]], TMap>[];

type RelQueryEntry<
  T extends AnyDesc,
  TMap extends ModelMap,
  K extends keyof T["relations"],
> = K extends keyof ExtractHasMany<T, TMap>
  ? HasManyRelQueryEntry<T, TMap, K>
  : ModelQuery<TMap[T["relations"][K]["relName"]], TMap>;

/**
 * examples for account:
 * {disabledBy: {fields: []}} // belongst
 * {cards: {fields: []}}
 * {cards: [{as: "myCards", fields: []}]}
 */
export type RelQuery<T extends AnyDesc, TMap extends ModelMap> = {
  [K in keyof T["relations"]]?: RelQueryEntry<T, TMap, K>;
};

type EnsureModelQuery<T> = T extends ModelQuery<any, any> ? T : never;
type EnsureHasManyQuery<T> = T extends AbstractHasManyQuery ? T : never;

type EnrichBelongsTo<M extends AnyDesc, TMap extends ModelMap> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<any, infer Opts>
    ? Opts extends BelongsToOpts<infer TFk>
      ? {
          model: TMap[M["relations"][K]["relName"]];
          fk: TFk;
          field: M["fields"][TFk] extends TypedField<"belongsTo", infer FieldType, infer FieldOpts>
            ? {type: FieldType} & FieldOpts
            : never;
        }
      : never
    : never;
}>;

type ExtractHasMany<M extends AnyDesc, TMap extends ModelMap> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<
    infer RelName,
    {type: "hasMany"}
  >
    ? {model: TMap[RelName]}
    : never;
}>;

type ExtractHasOne<M extends AnyDesc, TMap extends ModelMap> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<
    infer RelName,
    {type: "hasOne"}
  >
    ? {model: TMap[RelName]}
    : never;
}>;

// type RealModelMap = typeof modelMap;
// type AccountDesc = typeof accountDesc;
// type AccMany = ExtractHasMany<AccountDesc, RealModelMap>;
// const accBel = {} as AccMany;

// const a = {} as RelQuery<AccountDesc, RealModelMap>;

export type InferModelQuery<
  M extends AnyDesc,
  Q extends ModelQuery<M, TMap>,
  TMap extends ModelMap,
> = (Q["fields"] extends (keyof M["fields"])[]
  ? {[K in Q["fields"][number]]: InferFieldType<M["fields"][K]>}
  : {}) &
  (Q["relations"] extends RelQuery<M, TMap> ? InferRelQuery<M, Q["relations"], TMap> : {}) & {
    // add id fields
    [K in M["keys"][number] & string]: InferFieldType<M["fields"][K]>;
  } & {
    // add meta info
    "~model": M["name"];
    "~key": string;
  };

type IsOptional<T, Test> = Test extends true ? T | null : T;

type EmptyObjIfNever<T> = [T] extends [never] ? {} : T;

type ExtractRelQueryArray<M extends AnyDesc, TMap extends ModelMap, Q extends RelQuery<M, TMap>> = {
  [K in keyof Q]: K extends keyof ExtractHasMany<M, TMap>
    ? Q[K] extends HasManyQueryWithAs<any, any>[]
      ? {
          [Item in Q[K][number] as Item["as"]]: InferHasMany<
            ExtractHasMany<M, TMap>[K]["model"],
            TMap,
            Item
          >;
        }
      : never
    : never;
}[keyof Q];

type InferHasMany<
  M extends AnyDesc,
  TMap extends ModelMap,
  QM extends HasManyQuery<M, TMap>,
> = QM extends {type: "count"}
  ? number
  : QM extends {type: "exist"}
    ? boolean
    : QM extends {type: "first"}
      ? InferModelQuery<M, EnsureModelQuery<QM>, TMap> | null
      : InferModelQuery<M, EnsureModelQuery<QM>, TMap>[];

type InferRelEntry<
  M extends AnyDesc,
  TMap extends ModelMap,
  Q extends RelQuery<any, any>,
  K extends keyof Q,
> = K extends keyof EnrichBelongsTo<M, TMap>
  ? IsOptional<
      InferModelQuery<EnrichBelongsTo<M, TMap>[K]["model"], EnsureModelQuery<Q[K]>, TMap>,
      EnrichBelongsTo<M, TMap>[K]["field"]["optional"]
    >
  : K extends keyof ExtractHasMany<M, TMap>
    ? InferHasMany<ExtractHasMany<M, TMap>[K]["model"], TMap, EnsureHasManyQuery<Q[K]>>
    : K extends keyof ExtractHasOne<M, TMap>
      ? InferModelQuery<ExtractHasOne<M, TMap>[K]["model"], EnsureModelQuery<Q[K]>, TMap>
      : never;

type InferKeyName<Q extends RelQuery<any, any>, K extends keyof Q> =
  Q[K] extends Array<any>
    ? never
    : Q[K] extends {as: string}
      ? K extends keyof ExtractHasMany<any, any>
        ? Q[K]["as"]
        : K
      : K;

export type InferRelQuery<
  M extends AnyDesc,
  Q extends RelQuery<M, TMap>,
  TMap extends ModelMap,
> = EmptyObjIfNever<ExtractRelQueryArray<M, TMap, Q>> &
  EmptyObjIfNever<{
    [K in keyof Q as InferKeyName<Q, K>]: InferRelEntry<M, TMap, Q, K>;
  }>;

export type Instance<M extends keyof ModelMap> = {
  "~model": M;
  "~key": string;
};
