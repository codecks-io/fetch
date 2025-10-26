import {configuredFetch, type FetchOptions} from "../loaders/loader-utils";
import type {ApiResponse} from "../model-pool";
import type {BaseRequester, MissingDataRequest} from "./loader-types";
import type {SerializableRelationQuery} from "../query-type";
import {serializeModel} from "../query-helpers";
import {ensureMapValue} from "../collection-utils";

const mergeRelations = (
  r1: SerializableRelationQuery & {asField: false},
  r2: SerializableRelationQuery & {asField: false}
): SerializableRelationQuery => {
  const nextRels = {...r1.relations};
  for (const [relKey, relQuery] of Object.entries(r2.relations || {})) {
    const exist = nextRels[relKey];
    if (exist && !exist.asField && !relQuery.asField) {
      nextRels[relKey] = mergeRelations(exist, relQuery);
    } else {
      nextRels[relKey] = relQuery;
    }
  }
  return {
    ...r1,
    fields: [...(r1.fields ?? []), ...(r2.fields ?? [])],
    relations: nextRels,
  };
};

export class ApiRequester implements BaseRequester {
  private readonly fetchOptions: FetchOptions;

  constructor(fetchOptions: FetchOptions) {
    this.fetchOptions = fetchOptions;
  }

  async request(
    requests: MissingDataRequest[]
  ): Promise<{model: string; key: string; partialInstance: Record<string, unknown>}[]> {
    if (requests.length === 0) return [];

    const dataByModel = new Map<
      string,
      Map<string, {fields: Set<string>; relations: Map<string, SerializableRelationQuery>}>
    >();

    for (const req of requests) {
      const instancesById = ensureMapValue(dataByModel, req.model, () => new Map());
      let instanceData = ensureMapValue(instancesById, req.id, () => ({
        fields: new Set(),
        relations: new Map(),
      }));

      if (req.type === "field") {
        instanceData.fields.add(req.field);
      } else if (req.type === "relation") {
        const existing = instanceData.relations.get(req.relKey);
        if (existing && !existing.asField && !req.query.asField) {
          instanceData.relations.set(req.relKey, mergeRelations(existing, req.query));
        } else {
          instanceData.relations.set(req.relKey, req.query);
        }
      }
    }

    const query: Record<string, any> = {};
    for (const [model, instancesById] of dataByModel) {
      for (const [id, instanceData] of instancesById) {
        const queryKey = model === "_root" ? "_root" : `${model}(${id})`;
        query[queryKey] = serializeModel({
          fields: [...instanceData.fields],
          relations: Object.fromEntries(instanceData.relations),
        });
      }
    }

    const result = await configuredFetch<ApiResponse>(this.fetchOptions, "", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({query}),
    });

    const results: {model: string; key: string; partialInstance: Record<string, unknown>}[] = [];

    for (const [modelName, instances] of Object.entries(result)) {
      if (modelName === "_root") {
        results.push({
          model: "_root",
          key: "",
          partialInstance: instances as Record<string, unknown>,
        });
      } else {
        for (const [id, data] of Object.entries(instances as Record<string, any>)) {
          results.push({
            model: modelName,
            key: id,
            partialInstance: data,
          });
        }
      }
    }

    return results;
  }
}
