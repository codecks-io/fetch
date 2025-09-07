import type {
  InferFieldType,
  AnyDesc,
  RelationEntry,
  BelongsToOpts,
} from "./models/_desc";
import type { TypedField } from "./models/_fields";
import type { FilterNeverKeys } from "./models/_type-helpers";

export type ModelQuery<T extends AnyDesc, TMap extends ModelMap> = {
  fields?: (keyof T["fields"])[];
  relations?: RelQuery<T, TMap>;
};

export type ModelQueryWithFilter<
  T extends AnyDesc,
  TMap extends ModelMap,
> = ModelQuery<T, TMap> & {
  orderBy?: keyof T["fields"];
  limit?: number;
  where?: any; // TODO
  as?: string;
};

type ModelQueryWithFilterAndAs<
  T extends AnyDesc,
  TMap extends ModelMap,
> = ModelQueryWithFilter<T, TMap> & {
  as: string;
};

type ModelMap = Record<string, AnyDesc>;

export type RelQuery<T extends AnyDesc, TMap extends ModelMap> = {
  [K in keyof T["relations"]]?: K extends keyof ExtractHasMany<T, TMap>
    ?
        | ModelQueryWithFilter<TMap[T["relations"][K]["relName"]], TMap>
        | ModelQueryWithFilterAndAs<TMap[T["relations"][K]["relName"]], TMap>[]
    : ModelQuery<TMap[T["relations"][K]["relName"]], TMap>;
};

type EnrichBelongsTo<
  M extends AnyDesc,
  TMap extends ModelMap,
> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<
    any,
    infer Opts
  >
    ? Opts extends BelongsToOpts<infer TFk>
      ? {
          model: TMap[M["relations"][K]["relName"]];
          fk: TFk;
          field: M["fields"][TFk] extends TypedField<
            "belongsTo",
            infer FieldType,
            infer FieldOpts
          >
            ? { type: FieldType } & FieldOpts
            : never;
        }
      : never
    : never;
}>;

type ExtractHasMany<
  M extends AnyDesc,
  TMap extends ModelMap,
> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<
    infer RelName,
    { type: "hasMany" }
  >
    ? { model: TMap[RelName] }
    : never;
}>;

type ExtractHasOne<M extends AnyDesc, TMap extends ModelMap> = FilterNeverKeys<{
  [K in keyof M["relations"]]: M["relations"][K] extends RelationEntry<
    infer RelName,
    { type: "hasOne" }
  >
    ? { model: TMap[RelName] }
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
  ? { [K in Q["fields"][number]]: InferFieldType<M["fields"][K]> }
  : {}) &
  (Q["relations"] extends RelQuery<M, TMap>
    ? InferRelQuery<M, Q["relations"], TMap>
    : {}) & {
    [K in M["keys"][number] & string]: InferFieldType<M["fields"][K]>;
  } & {
    "~model": M["name"];
    "~key": string;
  };

type IsOptional<T, Test> = Test extends true ? T | null : T;

type EmptyObjIfNever<T> = [T] extends [never] ? {} : T;
type EnsureAnyDesc<T> = T extends AnyDesc ? T : never;

type ExtractRelQueryArray<
  M extends AnyDesc,
  Q extends RelQuery<M, TMap>,
  TMap extends ModelMap,
> = {
  [K in keyof Q]: K extends keyof ExtractHasMany<M, TMap>
    ? Q[K] extends ModelQueryWithFilterAndAs<any, any>[]
      ? {
          [Item in Q[K][number] as Item["as"]]: InferModelQuery<
            ExtractHasMany<M, TMap>[K]["model"],
            Item,
            TMap
          >[];
        }
      : never
    : never;
}[keyof Q];

export type InferRelQuery<
  M extends AnyDesc,
  Q extends RelQuery<M, TMap>,
  TMap extends ModelMap,
> = EmptyObjIfNever<
  ExtractRelQueryArray<M, Q, TMap> & {
    [K in keyof Q as Q[K] extends Array<any>
      ? never
      : Q[K] extends { as: string }
        ? K extends keyof ExtractHasMany<any, any>
          ? Q[K]["as"]
          : K
        : K]: K extends keyof EnrichBelongsTo<M, TMap>
      ? IsOptional<
          InferModelQuery<
            EnrichBelongsTo<M, TMap>[K]["model"],
            EnsureAnyDesc<Q[K]>,
            TMap
          >,
          EnrichBelongsTo<M, TMap>[K]["field"]["optional"]
        >
      : K extends keyof ExtractHasMany<M, TMap>
        ? InferModelQuery<
            ExtractHasMany<M, TMap>[K]["model"],
            EnsureAnyDesc<Q[K]>,
            TMap
          >[]
        : K extends keyof ExtractHasOne<M, TMap>
          ? InferModelQuery<
              ExtractHasOne<M, TMap>[K]["model"],
              EnsureAnyDesc<Q[K]>,
              TMap
            >
          : never;
  }
>;

export type Instance<M extends keyof ModelMap> = {
  "~model": M;
  "~key": string;
};
