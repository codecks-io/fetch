import {configuredFetch, type DataLoader, type FetchOptions} from "./loader-utils";
import {ModelPool, type ApiResponse} from "./model-pool";
import {modelMap} from "./models";
import {serializeInstanceQuery} from "./query-helpers";
import type {Instance} from "./query-type";
import {reconcileInstanceQuery} from "./reconcile-query";

export type SimpleLoaderOptions = FetchOptions;

export const createSimpleLoader = (opts: SimpleLoaderOptions = {}): DataLoader => {
  const fetchWithQuery = async (query: Record<string, unknown>) => {
    const response = await configuredFetch(opts, "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({query}),
    }).then(async (r) => {
      const content = await r.json();
      if (r.status !== 200) {
        throw new Error(`[${r.status}] ${JSON.stringify(content)}`);
      }
      return content as Promise<ApiResponse>;
    });
    return response;
  };

  return {
    fetchModel: async (model, ids, q) => {
      const modelDesc = modelMap[model];
      const instances: Instance<typeof model>[] = ids.map((id) => ({
        "~model": model,
        "~key": id,
      }));
      const response = await fetchWithQuery(serializeInstanceQuery(q, instances, modelMap));
      const pool = new ModelPool(modelMap);
      pool.add(response);
      return Object.fromEntries(
        ids.map((id) => [id, reconcileInstanceQuery(q, response, modelDesc, id, pool)])
      ) as any;
    },
  };
};
