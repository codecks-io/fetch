import type {modelMap} from "../models";
import type {_rootDesc} from "../models/_root";
import type {InferModelQuery, InferRelQuery, ModelQuery, RelQuery} from "../query-type";
import {use, useSyncExternalStore} from "react";
import {Store} from "./store";
import {UserQueryManager} from "./user-query-manager";

type ModelMap = typeof modelMap;

const store = new Store();
const queryManager = new UserQueryManager(store);

export const useFetch = <
  K extends keyof ModelMap,
  Id extends string,
  const Q extends ModelQuery<ModelMap[K], ModelMap>,
>(
  model: K,
  id: Id,
  q: Q
): InferModelQuery<ModelMap[K], Q, ModelMap> => {
  // queryObj needs to be stable accross renders if the query parts stay the same
  const queryObj = queryManager.getQuery(model, [id], q);
  const val = useSyncExternalStore<any>(queryObj.subscribe, queryObj.get);
  if (val.state === "pending") return use(val.promise);
  return val.value;
};

export const useFetchFromRoot = <
  const Q extends RelQuery<typeof _rootDesc, ModelMap>,
>(): InferRelQuery<typeof _rootDesc, Q, ModelMap> => {
  return null as any;
};
