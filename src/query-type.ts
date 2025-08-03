import type { InferFieldType, StrictAnyDesc } from "./models/_desc";
import type { FilterNeverKeys } from "./models/_type-helpers";
import { accountDesc, rootDesc, userDesc } from "./models/Account";

type QueryAllRes<M extends StrictAnyDesc, MF> = {
  type: "all";
  model: M;
  query: MF;
};

type QueryFnRes = QueryAllRes<any, any>;

type ExtractHasMany<M extends StrictAnyDesc> = FilterNeverKeys<{
  [K in keyof M["hasMany"]]: M["hasMany"][K] extends {
    isSingleton: false;
    getModel: () => infer M;
  }
    ? M extends StrictAnyDesc
      ? M
      : never
    : never;
}>;

type ExtractHasOne<M extends StrictAnyDesc> = FilterNeverKeys<{
  [K in keyof M["hasMany"]]: M["hasMany"][K] extends {
    isSingleton: true;
    getModel: () => infer M;
  }
    ? M extends StrictAnyDesc
      ? M
      : never
    : never;
}>;

// type QueryObj<M extends StrictAnyDesc> = <
//   const K extends keyof ExtractHasMany<M>,
// >(
//   relName: K,
// ) => QueryFns<ExtractHasMany<M>[K]>;
type QueryObj<M extends StrictAnyDesc> = {
  all: <K extends keyof ModelMap, const MF extends ModelFields<ModelMap[K]>>(
    relName: K,
    fields: MF,
  ) => QueryAllRes<ModelMap[K], MF>;
};

type ModelFields<T extends StrictAnyDesc> = {
  f?: (keyof T["fields"])[];
  rel?: QueryDict<T>;
};
type QueryDict<T extends StrictAnyDesc> =
  | Record<string, (q: QueryObj<T>) => QueryFnRes>
  | Partial<{
      [K in keyof ExtractHasOne<T>]: ModelFields<ExtractHasOne<T>[K]>;
    }>
  | Partial<{
      [K in keyof ExtractHasMany<T>]: (q: QueryObj<T>) => QueryFnRes;
    }>;

type InferQueryFn<T> = T extends (q: QueryObj<any>) => infer Res
  ? Res extends QueryAllRes<infer M, infer MF>
    ? InferResultFromModel<M, MF>
    : never
  : never;

type ObjectKeys<T> = T extends Record<string, any> ? keyof T : never;
type InferResultFromModel<M extends StrictAnyDesc, T> =
  T extends Array<infer El>
    ? {
        [K in El & keyof M["fields"]]: InferFieldType<M["fields"][K]>;
      } & {
        [K in ObjectKeys<El>]: El extends Record<string, any>
          ? K extends keyof El
            ? InferQueryFn<El[K]>
            : never
          : never;
      }
    : never;

// type InferResultFromDict<T extends QueryDict<any>> =
//   T extends QueryDict<infer M>
//     ? {
//         [K in keyof T]: T[K] extends ModelFields<any>
//           ? InferResultFromModel<M, any>
//           : never;
//       }
//     : never;

const rootQuery = <T extends QueryDict<typeof rootDesc>>(q: T) => {
  return null as any;
};

rootQuery({});

// const userQuery = <T extends StrictAnyDesc, MF extends ModelFields<T>>(
//   desc: T,
//   q: MF,
// ): InferResultFromModel<T, MF> => {
//   return null as any;
// };

// const res = userQuery(userDesc, {f: ["name", "email"], r: {
//     accounts: (q) => q.all("accounts", ["name", "sad"]),
//   }})

const MODELS = {
  accounts: accountDesc,
  users: userDesc,
} as const;

type ModelMap = typeof MODELS;

const q = null as any as QueryObj<typeof userDesc>;
const r1 = q.all("users", {
  f: ["email"],
  rel: {
    accounts: (q) =>
      q.all("users", {
        f: ["name"],
        rel: {
          accounts: (q) => q.all("users", { f: ["email"] }),
        },
      }),
  },
});
const r2 = q.all("accounts", { f: ["name"] });
