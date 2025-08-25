import type { AnyDesc } from "./models/_desc";
import { rootDesc } from "./models/models";
import type { Instance, ModelDict, RelDict } from "./query-type";

const serializeModel = (q: ModelDict<any>, modelDesc: any) => {
  const list: any[] = q.fields ? [...q.fields] : [];
  if (!q.relations) return list;
  const relObj: Record<string, unknown> = {};
  list.push(relObj);
  Object.entries(q.relations).forEach(([k, _v]) => {
    const rels = Array.isArray(_v) ? _v : [_v];
    rels.forEach((r) => {
      const getKey = () => {
        const belongsToKey = modelDesc.belongsToMap[k];
        return belongsToKey || k;
      };
      relObj[getKey()] = serializeModel(r as ModelDict<any>, modelDesc);
    });
  });
  return list;
};

const serializeRelations = (q: RelDict<any>, modelDesc: AnyDesc) => {
  return Object.fromEntries(
    Object.entries(q).map(([k, v]) => [
      k,
      serializeModel(v as ModelDict<any>, modelDesc.relations[k]),
    ]),
  );
};

export const serializeRootQuery = <T extends RelDict<typeof rootDesc>>(
  q: T,
): Record<string, unknown> => {
  return { _root: serializeRelations(q, rootDesc) };
};

export const serializeInstanceQuery = (
  q: ModelDict<any>,
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
