import type {AnyDesc} from "./models/_desc";
import {modelMap} from "./models";
import type {HasManyQuery, Instance, ModelQuery} from "./query-type";
import {_rootDesc} from "./models/_root";

type ModelMap = typeof modelMap;

export const getRelKey = <T extends HasManyQuery<any, any>>(r: T, k: string) => {
  const isPlainKey = () => {
    if (r.type === "first") return false;
    if (r.filter && Object.keys(r.filter).length > 0) return false;
    if (r.type === "query" || r.type === undefined) {
      if (r.limit || r.orderBy || r.offset) return false;
    }
    return true;
  };
  if (isPlainKey()) return k;
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
  return `${k}(${JSON.stringify(q)})`;
};

const serializeModel = (q: ModelQuery<any, any>, modelDesc: AnyDesc) => {
  const list: any[] = q.fields ? [...q.fields] : [];
  if (!q.relations) return list;
  const relObj: Record<string, unknown> = {};
  Object.entries(q.relations).forEach(([k, _v]) => {
    const rels = Array.isArray(_v) ? _v : [_v!];
    rels.forEach((r) => {
      switch (r?.type) {
        case "count": {
          list.push(`count:${getRelKey(r, k)}`);
          break;
        }
        case "exists": {
          list.push(`exists:${getRelKey(r, k)}`);
          break;
        }
        default:
          relObj[getRelKey(r, k)] = serializeModel(r as ModelQuery<any, any>, modelDesc);
          break;
      }
    });
  });
  if (Object.keys(relObj).length) list.push(relObj);
  return list;
};

export const serializeInstanceQuery = (
  q: ModelQuery<any, any>,
  instances: Instance<keyof ModelMap>[],
  modelMap: ModelMap
) => {
  return Object.fromEntries(
    instances.map((instance) => {
      const name = instance["~model"];
      const getKey = () => {
        if (name === "_root") return "_root";
        return `${name}(${instance["~key"]})`;
      };
      return [getKey(), serializeModel(q, modelMap[name])];
    })
  );
};
