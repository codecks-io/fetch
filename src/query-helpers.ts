import type { AnyDesc } from "./models/_desc";
import { modelMap } from "./models";
import type { Instance, ModelQuery, RelQuery } from "./query-type";
import { _rootDesc } from "./models/_root";

type ModelMap = typeof modelMap;

const serializeModel = (q: ModelQuery<any, any>, modelDesc: AnyDesc) => {
  const list: any[] = q.fields ? [...q.fields] : [];
  if (!q.relations) return list;
  const relObj: Record<string, unknown> = {};
  Object.entries(q.relations).forEach(([k, _v]) => {
    const rels = Array.isArray(_v) ? _v : [_v];
    rels.forEach((r) => {
      switch (r?.type) {
        case "count": {
          list.push(`count(${k})`);
          break;
        }
        default:
          relObj[k] = serializeModel(r as ModelQuery<any, any>, modelDesc);
          break;
      }
    });
  });
  if (Object.keys(relObj).length) list.push(relObj);
  return list;
};

const serializeRelations = (q: RelQuery<any, any>, modelDesc: AnyDesc) => {
  return Object.fromEntries(
    Object.entries(q).map(([k, v]) => [
      k,
      serializeModel(v as ModelQuery<any, any>, modelDesc.relations[k]),
    ]),
  );
};

export const serializeRootQuery = <
  T extends RelQuery<typeof _rootDesc, typeof modelMap>,
>(
  q: T,
): Record<string, unknown> => {
  return { _root: serializeRelations(q, _rootDesc) };
};

export const serializeInstanceQuery = (
  q: ModelQuery<any, any>,
  instances: Instance<keyof ModelMap>[],
  modelMap: ModelMap,
) => {
  return Object.fromEntries(
    instances.map((instance) => {
      const name = instance["~model"];
      return [
        `${name}(${instance["~key"]})`,
        serializeModel(q, modelMap[name]),
      ];
    }),
  );
};
