export type FieldMeta = {state: "fresh"} | {state: "dirty"};

export interface FieldCache<T = any> {
  value: T;
  partKeys: string[];
  meta: FieldMeta;
}

type ModelInstance = Map<string, FieldCache>;

type ModelCache = Map<string, ModelInstance>;

export class ImmediateCache {
  cache: ModelCache = new Map<string, ModelInstance>();
  partKeyToFields = new Map<string, FieldCache[]>();

  private getInstanceKey(model: string, id: string): string {
    return `${model}:${id}`;
  }

  get(model: string, key: string, field: string): FieldCache | undefined {
    return this.cache.get(this.getInstanceKey(model, key))?.get(field);
  }

  set(
    model: string,
    key: string,
    partialInstance: Record<string, {value: unknown; partKeys: string[]}>,
    meta: FieldMeta
  ): void {
    const instanceKey = this.getInstanceKey(model, key);
    let entry = this.cache.get(instanceKey);
    if (!entry) {
      entry = new Map();
      this.cache.set(instanceKey, entry);
    }
    for (const field in partialInstance) {
      const f = partialInstance[field];
      const fieldEntry = {
        value: f.value,
        partKeys: f.partKeys,
        meta: meta,
      };
      entry.set(field, fieldEntry);
      for (const partKey of f.partKeys) {
        const maybeFields = this.partKeyToFields.get(partKey);
        if (!maybeFields) {
          this.partKeyToFields.set(partKey, [fieldEntry]);
        } else {
          maybeFields.push(fieldEntry);
        }
      }
    }
  }

  setMetaByPartKeys(partKeys: string[], meta: FieldMeta) {
    for (const partKey of partKeys) {
      const fields = this.partKeyToFields.get(partKey);
      if (!fields) continue;
      for (const field of fields) field.meta = meta;
    }
  }
}
