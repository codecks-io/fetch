import type { BelongsTo, InferFieldType, StrictAnyDesc } from "./models/_desc";
import type { FilterNeverKeys } from "./models/_type-helpers";

type EnsureStrictAnyDesc<T> = T extends StrictAnyDesc ? T : never;

type ExtractHasMany<M extends StrictAnyDesc> = FilterNeverKeys<{
  [K in keyof M["hasMany"]]: M["hasMany"][K] extends {
    isSingleton: false;
    getModel: () => infer M;
  }
    ? EnsureStrictAnyDesc<M>
    : never;
}>;

type ExtractHasOne<M extends StrictAnyDesc> = FilterNeverKeys<{
  [K in keyof M["hasMany"]]: M["hasMany"][K] extends {
    isSingleton: true;
    getModel: () => infer M;
  }
    ? EnsureStrictAnyDesc<M>
    : never;
}>;

type ExtractBelongsToHelper<M extends StrictAnyDesc> = {
  [K in keyof M["fields"] as M["fields"][K] extends BelongsTo<
    infer TRel extends string,
    any,
    any
  >
    ? TRel
    : never]: M["fields"][K] extends BelongsTo<any, () => infer TModel, any>
    ? TModel extends StrictAnyDesc
      ? TModel
      : never
    : never;
};

type ExtractBelongsTo<M extends StrictAnyDesc> =
  FilterNeverKeys<ExtractBelongsToHelper<M>> extends Record<
    string,
    StrictAnyDesc
  >
    ? FilterNeverKeys<ExtractBelongsToHelper<M>>
    : never;

type ExtractBelongsToWithOpts<M extends StrictAnyDesc> = {
  [K in keyof M["fields"] as M["fields"][K] extends BelongsTo<
    infer TRel extends string,
    any,
    any
  >
    ? TRel
    : never]: M["fields"][K] extends BelongsTo<
    any,
    () => infer TModel,
    infer Opts
  >
    ? TModel extends StrictAnyDesc
      ? { model: TModel; options: Opts }
      : never
    : never;
};

export type ModelDict<T extends StrictAnyDesc> = {
  fields?: (keyof T["fields"])[];
  relations?: RelDict<T>;
};

type ModelDictWithQuery<T extends StrictAnyDesc> = ModelDict<T> & {
  orderBy?: keyof T["fields"];
  limit?: number;
  as?: string;
};
type NamedModelDictWithQuery<T extends StrictAnyDesc> =
  ModelDictWithQuery<T> & { as: string };

export type RelDict<T extends StrictAnyDesc> = {
  [K in keyof ExtractHasMany<T>]?:
    | ModelDictWithQuery<ExtractHasMany<T>[K]>
    | NamedModelDictWithQuery<ExtractHasMany<T>[K]>[];
} & {
  [K in keyof ExtractHasOne<T>]?: ModelDict<ExtractHasOne<T>[K]>;
} & {
  [K in keyof ExtractBelongsTo<T>]?: ModelDict<ExtractBelongsTo<T>[K]>;
};

export type InferModelDict<
  M extends StrictAnyDesc,
  T extends ModelDict<M>,
> = (T["fields"] extends (keyof M["fields"])[]
  ? { [K in T["fields"][number]]: InferFieldType<M["fields"][K]> }
  : {}) &
  (T["relations"] extends RelDict<M> ? InferRelDict<M, T["relations"]> : {}) & {
    [K in M["keys"] & string]: InferFieldType<M["fields"][K]>;
  } & {
    "~model": M;
  };

type ExtractNamedRelations<M extends StrictAnyDesc, T extends RelDict<M>> = {
  [K in keyof T]: K extends keyof ExtractHasMany<M>
    ? T[K] extends NamedModelDictWithQuery<any>[]
      ? {
          [Item in T[K][number] as Item["as"]]: InferModelDict<
            ExtractHasMany<M>[K],
            Item
          >;
        }
      : never
    : never;
}[keyof T];

type EmptyObjIfNever<T> = [T] extends [never] ? {} : T;

export type InferRelDict<
  M extends StrictAnyDesc,
  T extends RelDict<M>,
> = EmptyObjIfNever<ExtractNamedRelations<M, T>> & {
  [K in keyof T as K extends keyof ExtractHasMany<M>
    ? T[K] extends NamedModelDictWithQuery<any>[]
      ? never
      : T[K] extends ModelDictWithQuery<any>
        ? T[K]["as"] extends string
          ? T[K]["as"]
          : K
        : never
    : K]: K extends keyof ExtractHasMany<M>
    ? T[K] extends ModelDictWithQuery<any>
      ? InferModelDict<ExtractHasMany<M>[K], T[K]>[]
      : never
    : K extends keyof ExtractHasOne<M>
      ? T[K] extends ModelDict<any>
        ? ExtractHasOne<M>[K] extends { force: true }
          ? InferModelDict<ExtractHasOne<M>[K], T[K]>
          : M["hasMany"][K] extends { options: { force: true } }
            ? InferModelDict<ExtractHasOne<M>[K], T[K]>
            : InferModelDict<ExtractHasOne<M>[K], T[K]> | null
        : never
      : K extends keyof ExtractBelongsToWithOpts<M>
        ? T[K] extends ModelDict<any>
          ? ExtractBelongsToWithOpts<M>[K] extends {
              model: infer M;
              options: infer Opts;
            }
            ? Opts extends { optional: true }
              ? InferModelDict<EnsureStrictAnyDesc<M>, T[K]> | null
              : InferModelDict<EnsureStrictAnyDesc<M>, T[K]>
            : never
          : never
        : never;
};

export type Instance<M extends StrictAnyDesc> = {
  "~model": M;
};

// export const modelQuery = <
//   M extends StrictAnyDesc,
//   const T extends ModelDict<M>,
// >(
//   model: M,
//   q: T,
// ): InferModelDict<M, T> => {
//   return null as any;
// };

// export const a = modelQuery(accountDesc, {
//   fields: ["name", "subdomain"],
//   // relations: {
//   //   creator: {
//   //     fields: ["email"],
//   //     relations: {
//   //       bestFriend: {
//   //         fields: ["email"],
//   //       },
//   //     },
//   //   },
//   // },
// });
