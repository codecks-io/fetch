import type {
  InferFieldType,
  AnyDesc,
  RelationEntry,
  BelongsToOpts,
} from "./models/_desc";
import type { TypedField } from "./models/_fields";
import type { FilterNeverKeys } from "./models/_type-helpers";
import { accountDesc } from "./models/Account";
import { modelMap } from "./models/models";

export type ModelQuery<T extends AnyDesc, TMap extends ModelMap> = {
  fields?: (keyof T["fields"])[];
  relations?: RelQuery<T, TMap>;
};

type ModelDictWithQuery<T extends AnyDesc, TMap extends ModelMap> = ModelQuery<
  T,
  TMap
> & {
  orderBy?: keyof T["fields"];
  limit?: number;
  as?: string;
};
type NamedModelDictWithQuery<
  T extends AnyDesc,
  TMap extends ModelMap,
> = ModelDictWithQuery<T, TMap> & {
  as: string;
};

type ModelMap = Record<string, AnyDesc>;

export type RelQuery<T extends AnyDesc, TMap extends ModelMap> = {
  [K in keyof T["relations"]]?: ModelQuery<
    TMap[T["relations"][K]["relName"]],
    TMap
  >;
};

type RealModelMap = typeof modelMap;
type AccountDesc = typeof accountDesc;

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

type AccBel = EnrichBelongsTo<AccountDesc, RealModelMap>;
const accBel = {} as AccBel;
accBel.disabledBy;

const a = {} as RelQuery<AccountDesc, RealModelMap>;

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

export type InferRelQuery<
  M extends AnyDesc,
  Q extends RelQuery<M, TMap>,
  TMap extends ModelMap,
> = {
  [K in keyof Q]: K extends keyof EnrichBelongsTo<M, TMap>
    ? IsOptional<
        InferModelQuery<
          EnrichBelongsTo<M, TMap>[K]["model"],
          NonNullable<Q[K]>,
          TMap
        >,
        EnrichBelongsTo<M, TMap>[K]["field"]["optional"]
      >
    : never;
};

type EmptyObjIfNever<T> = [T] extends [never] ? {} : T;

// export type InferRelQuery<
//   M extends AnyDesc,
//   T extends RelDict<M>,
// > = EmptyObjIfNever<ExtractNamedRelations<M, T>> & {
//   [K in keyof T as K extends keyof ExtractHasMany<M>
//     ? T[K] extends NamedModelDictWithQuery<any>[]
//       ? never
//       : T[K] extends ModelDictWithQuery<any>
//         ? T[K]["as"] extends string
//           ? T[K]["as"]
//           : K
//         : never
//     : K]: K extends keyof ExtractHasMany<M>
//     ? T[K] extends ModelDictWithQuery<any>
//       ? InferModelDict<ExtractHasMany<M>[K], T[K]>[]
//       : never
//     : K extends keyof ExtractHasOne<M>
//       ? T[K] extends ModelDict<any>
//         ? ExtractHasOne<M>[K] extends { force: true }
//           ? InferModelDict<ExtractHasOne<M>[K], T[K]>
//           : M["hasMany"][K] extends { options: { force: true } }
//             ? InferModelDict<ExtractHasOne<M>[K], T[K]>
//             : InferModelDict<ExtractHasOne<M>[K], T[K]> | null
//         : never
//       : K extends keyof ExtractBelongsToWithOpts<M>
//         ? T[K] extends ModelDict<any>
//           ? ExtractBelongsToWithOpts<M>[K] extends {
//               model: infer M;
//               options: infer Opts;
//             }
//             ? Opts extends { optional: true }
//               ? InferModelDict<EnsureAnyDesc<M>, T[K]> | null
//               : InferModelDict<EnsureAnyDesc<M>, T[K]>
//             : never
//           : never
//         : never;
// };

export type Instance<M extends AnyDesc> = {
  "~model": M;
  "~key": string;
};

// export const modelQuery = <
//   M extends AnyDesc,
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
