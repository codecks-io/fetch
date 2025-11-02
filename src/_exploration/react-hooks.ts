import {modelMap} from "../models";
import type {_rootDesc} from "../models/_root";
import type {InferModelQuery, InferRelQuery, ModelQuery, RelQuery} from "../query-type";
import {use, useSyncExternalStore} from "react";
import {Store} from "./store";
import {UserQueryManager} from "./user-query-manager";
import {BatchedLoader} from "./loader";
import {ApiRequester} from "./api-requester";

type ModelMap = typeof modelMap;

const loader = new BatchedLoader({
  batchTimeoutMs: 0,
  requester: new ApiRequester({
    baseUrl: "https://api.example.com/",
  }),
});

const store = new Store(modelMap, loader);
const queryManager = new UserQueryManager(store);

const useQueryManager = (model: string, ids: string[], q: ModelQuery<any, any>) => {
  // queryObj needs to be stable accross renders if the query parts stay the same
  const queryObj = queryManager.getQuery(model, ids, q);
  const val = useSyncExternalStore<any>(queryObj.subscribe, queryObj.get);
  if (val.state === "pending") return use(val.promise);
  return val.value;
};

export const useFetch = <
  K extends keyof ModelMap,
  Id extends string,
  const Q extends ModelQuery<ModelMap[K], ModelMap>,
>(
  model: K,
  id: Id,
  q: Q
): InferModelQuery<ModelMap[K], Q, ModelMap> => {
  return useQueryManager(model, [id], q);
};

export const useFetchFromRoot = <const Q extends RelQuery<typeof _rootDesc, ModelMap>>(
  q: Q
): InferRelQuery<typeof _rootDesc, Q, ModelMap> => {
  return useQueryManager("_root", [""], {relations: q});
};
