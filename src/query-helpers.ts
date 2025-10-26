import {modelMap} from "./models";
import type {
  HasManyQuery,
  Instance,
  ModelQuery,
  RelQuery,
  SerializableModelQuery,
  SerializableRelationQuery,
} from "./query-type";
import {_rootDesc} from "./models/_root";

type ModelMap = typeof modelMap;

export const getRelKey = <T extends HasManyQuery<any, any>>(r: T, k: string) => {
  const getSuffix = () => {
    if (r.type === "exists") return `exists:`;
    if (r.type === "count") return `count:`;
    return "";
  };
  const suffix = getSuffix();
  const isPlainKey = () => {
    if (r.type === "first") return false;
    if (r.filter && Object.keys(r.filter).length > 0) return false;
    if (r.type === "query" || r.type === undefined) {
      if (r.limit || r.orderBy || r.offset) return false;
    }
    return true;
  };
  if (isPlainKey()) return `${suffix}${k}`;
  const q: Record<string, any> = {...r.filter};
  if (r.type === "first") {
    q.$first = true;
    q.$order = r.orderBy;
  }
  if (r.type === "query" || r.type === undefined) {
    if (r.limit) q.$limit = r.limit;
    if (r.offset) q.$offset = r.offset;
    if (r.orderBy) q.$order = r.orderBy;
  }
  return `${suffix}${k}(${JSON.stringify(q)})`;
};

const processRelations = (rels: RelQuery<any, any>): Record<string, SerializableRelationQuery> => {
  const result: Record<string, SerializableRelationQuery> = {};
  for (const [key, relq] of Object.entries(rels)) {
    const asArray = Array.isArray(relq) ? relq : [relq];
    for (const rel of asArray) {
      if (!rel) continue;
      result[getRelKey(rel, key)] = makeRelQuerySerializable(rel);
    }
  }
  return result;
};

export const makeModelQuerySerializable = (q: ModelQuery<any, any>): SerializableModelQuery => {
  if (!q.relations) return q as SerializableModelQuery;
  return {...q, relations: processRelations(q.relations)};
};

export const makeRelQuerySerializable = (r: HasManyQuery<any, any>): SerializableRelationQuery => {
  if (r.type === "exists" || r.type === "count") return {asField: true};
  return {
    asField: false,
    fields: r.fields,
    relations: r.relations ? processRelations(r.relations) : undefined,
  };
};

export const serializeModel = (q: SerializableModelQuery) => {
  const list: any[] = q.fields ? [...q.fields] : [];
  if (!q.relations) return list;
  const relObj: Record<string, unknown> = {};
  Object.entries(q.relations).forEach(([k, r]) => {
    if (r.asField) {
      list.push(k);
    } else {
      relObj[k] = serializeModel(r);
    }
  });

  if (Object.keys(relObj).length) list.push(relObj);
  return list;
};

export const serializeInstanceQuery = (
  q: SerializableModelQuery,
  instances: Instance<keyof ModelMap>[]
) => {
  return Object.fromEntries(
    instances.map((instance) => {
      const name = instance["~model"];
      const getKey = () => {
        if (name === "_root") return "_root";
        return `${name}(${instance["~key"]})`;
      };
      return [getKey(), serializeModel(q)];
    })
  );
};
