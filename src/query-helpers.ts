import type { AnyDesc } from "./models/_desc";
import { modelMap, rootDesc } from "./models/models";
import type { Instance, ModelQuery, RelQuery } from "./query-type";

const serializeModel = (q: ModelQuery<any, any>, modelDesc: AnyDesc) => {
  const list: any[] = q.fields ? [...q.fields] : [];
  if (!q.relations) return list;
  const relObj: Record<string, unknown> = {};
  list.push(relObj);
  Object.entries(q.relations).forEach(([k, _v]) => {
    const rels = Array.isArray(_v) ? _v : [_v];
    rels.forEach((r) => {
      relObj[k] = serializeModel(r as ModelQuery<any, any>, modelDesc);
    });
  });
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
  T extends RelQuery<typeof rootDesc, typeof modelMap>,
>(
  q: T,
): Record<string, unknown> => {
  return { _root: serializeRelations(q, rootDesc) };
};

export const serializeInstanceQuery = (
  q: ModelQuery<any, any>,
  instances: Instance<AnyDesc>[],
) => {
  return Object.fromEntries(
    instances.map((instance) => {
      const desc = instance["~model"];
      return [
        `${desc.name}(${instance["~key"]})`,
        serializeModel(q, instance["~model"]),
      ];
    }),
  );
};
