import { ensureMapValue } from "./collection-utils";
import type { StrictAnyDesc } from "./models/_desc";
import { rootDesc } from "./models/models";

type RootDesc = typeof rootDesc;
const ROOT_ID = "";

export type ApiResponse = Record<RootDesc["name"], Record<string, any>> &
  Record<string, Record<string, any>>;

export class ModelPool {
  private data: Map<string, any> = new Map();
  private modelMap: Record<string, StrictAnyDesc>;

  constructor(modelMap: Record<string, StrictAnyDesc>) {
    this.modelMap = modelMap;
  }

  private addModelInstance(
    model: string,
    id: string,
    data: Record<string, any>,
  ) {
    const instanceById = ensureMapValue(this.data, model, () => new Map());
    const exists = instanceById.get(id);
    if (exists) {
      Object.assign(exists, data);
    } else {
      instanceById.set(id, data);
    }
  }

  public add(data: ApiResponse) {
    Object.entries(data).forEach(([modelName, payload]) => {
      if (modelName === rootDesc.name) {
        this.addModelInstance(modelName, ROOT_ID, payload);
      } else {
        Object.entries(payload).forEach(([id, payload]) => {
          this.addModelInstance(modelName, id, payload);
        });
      }
    });
  }

  public get(model: string, id: string) {
    const instances = this.data.get(model);
    if (!instances) return null;
    return instances.get(id) ?? null;
  }
}
