import { ensureMapValue } from "./collection-utils";
import type { AnyDesc } from "./models/_desc";
import type { FieldEntry } from "./models/_fields";
import { rootDesc } from "./models/models";

type RootDesc = typeof rootDesc;
const ROOT_ID = "";

export type ApiResponse = Record<RootDesc["name"], Record<string, any>> &
  Record<string, Record<string, any>>;

const dateStrToDay = (dateAsStr: string) => {
  const parts = dateAsStr.split("-");
  return {
    year: parseInt(parts[0], 10),
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10),
  };
};

const parseField = (v: any, field: FieldEntry | null) => {
  if (!field) return v;
  switch (field.type) {
    case "date":
      return new Date(v);
    case "day":
      return dateStrToDay(v);
    default:
      return v;
  }
};

const transformData = (desc: AnyDesc, data: Record<string, any>) => {
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, parseField(v, desc.fields[k])]),
  );
};

export class ModelPool {
  private data: Map<string, any> = new Map();
  private modelMap: Record<string, AnyDesc>;

  constructor(modelMap: Record<string, AnyDesc>) {
    this.modelMap = modelMap;
  }

  private addModelInstance(
    model: string,
    id: string,
    _data: Record<string, any>,
  ) {
    const instanceById = ensureMapValue(this.data, model, () => new Map());
    const exists = instanceById.get(id);
    const desc = this.modelMap[model];
    if (!desc) throw new Error(`Unknown model: ${model}`);
    const data = transformData(desc, _data);
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
