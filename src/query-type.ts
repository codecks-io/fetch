import type {Filter, Order} from "./has-many-filter-type";
import type {InferFieldType, AnyDesc, RelationEntry, BelongsToOpts} from "./models/_desc";
import type {TypedField} from "./models/_fields";
import type {FilterNeverKeys} from "./models/_type-helpers";

type ModelMap = Record<string, AnyDesc>;

export type SerializableRelationQuery =
  | {asField: true}
  | {asField: false; fields?: string[]; relations?: Record<string, SerializableRelationQuery>};

export interface SerializableModelQuery {
  fields?: string[];
  relations?: Record<string, SerializableRelationQuery>;
}

export interface ModelQuery<T extends AnyDesc, TMap extends ModelMap> {
  fields?: (keyof T["fields"] & string)[];
  relations?: RelQuery<T, TMap>;
}

interface BaseHasManyQuery<T extends AnyDesc, TMap extends ModelMap> extends ModelQuery<T, TMap> {
  type?: "query";
  filter?: Filter<T, TMap>;
  as?: string;
}

/**
 * A `limit`/`offset` "subset" requires an `orderBy` server-side (otherwise the
 * API rejects the query with "needs an order ... to be able to use subset"), and
 * `offset` is only meaningful together with `limit`. The union below makes the
 * omission a compile error instead of a runtime 500.
 */
type SimpleHasManyQuery<T extends AnyDesc, TMap extends ModelMap> = BaseHasManyQuery<T, TMap> &
  (
    | {orderBy?: Order<T>; limit?: never; offset?: never}
    | {orderBy: Order<T>; limit: number; offset?: number}
  );

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

/**
 * `fkAsArray` hasMany relations (e.g. card `childCards`/`inDeps`/`outDeps`/
 * `cardReferences`/`attachments`, workflowItem `inDeps`/`outDeps`) are stored as
 * a plain id array column server-side. They support only plain selection
 * (`fields` + nested `relations`) and the `count`/`exists` aggregates — any
 * relQuery modifier (`filter`, `orderBy`, `limit`, `offset`, `type: "first"`) is
 * rejected at runtime ("doesn't support relQueries"). The types mirror that.
 */
interface FkAsArrayQuery<T extends AnyDesc, TMap extends ModelMap> extends ModelQuery<T, TMap> {
  type?: "query";
  as?: string;
  orderBy?: never;
  limit?: never;
  offset?: never;
  filter?: never;
}

interface FkAsArrayCountOrExistQuery {
  type: "count" | "exists";
  as: string;
  fields?: never;
  relations?: never;
  filter?: never;
}

export type FkAsArrayHasManyQuery<T extends AnyDesc, TMap extends ModelMap> =
  | FkAsArrayQuery<T, TMap>
  | FkAsArrayCountOrExistQuery;

type AbstractHasManyQuery =
  | (ModelQuery<any, any> & {
      type?: "query" | "first";
      as?: string;
    })
  | {type: "count" | "exists"; as: string};

type HasManyQueryWithAs<T extends AnyDesc, TMap extends ModelMap> = HasManyQuery<T, TMap> & {
  as: string;
};

type FkAsArrayHasManyQueryWithAs<T extends AnyDesc, TMap extends ModelMap> = FkAsArrayHasManyQuery<
  T,
  TMap
> & {
  as: string;
};

export type SingleHasManyOrModelQuery = ModelQuery<any, any> | HasManyQuery<any, any>;

type HasManyRelQueryEntry<
  T extends AnyDesc,
  TMap extends ModelMap,
  K extends keyof ExtractHasMany<T, TMap>,
> = ExtractHasMany<T, TMap>[K] extends {fkAsArray: true}
  ?
      | FkAsArrayHasManyQuery<ExtractHasMany<T, TMap>[K]["model"], TMap>
      | FkAsArrayHasManyQueryWithAs<ExtractHasMany<T, TMap>[K]["model"], TMap>[]
  :
      | HasManyQuery<ExtractHasMany<T, TMap>[K]["model"], TMap>
      | HasManyQueryWithAs<ExtractHasMany<T, TMap>[K]["model"], TMap>[];

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
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<infer RelName, infer Opts>
    ? Opts extends {type: "hasMany"}
      ? {model: TMap[RelName]; fkAsArray: Opts extends {fkAsArray: true} ? true : false}
      : never
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
  : QM extends {type: "exists"}
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
