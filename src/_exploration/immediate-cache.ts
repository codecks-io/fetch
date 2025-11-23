export type FieldMeta = {state: "fresh"} | {state: "dirty"};

export interface FieldCache<T = any> {
  value: T;
  partKeys: string[];
  meta: FieldMeta;
}

type ModelInstance = Map<string, FieldCache>;

type ModelCache = Map<string, ModelInstance>;

type FieldSub = () => void;

export const getFieldKey = (model: string, id: string, field: string) => `${model}:${id}:${field}`;

export class ImmediateCache {
  cache: ModelCache = new Map<string, ModelInstance>();
  partKeyToFields = new Map<string, FieldCache[]>();
  private fieldSubscriptions = new Map<string, Set<FieldSub>>();

  private getInstanceKey(model: string, id: string): string {
    return `${model}:${id}`;
  }

  get(model: string, key: string, field: string): FieldCache | undefined {
    return this.cache.get(this.getInstanceKey(model, key))?.get(field);
  }

  subscribe(fieldKey: string, notifyFn: FieldSub): () => void {
    const exists = this.fieldSubscriptions.get(fieldKey);
    if (exists) {
      exists.add(notifyFn);
    } else {
      this.fieldSubscriptions.set(fieldKey, new Set([notifyFn]));
    }
    return () => {
      const subs = this.fieldSubscriptions.get(fieldKey);
      if (!subs) return;
      subs.delete(notifyFn);
      if (subs.size === 0) this.fieldSubscriptions.delete(fieldKey);
    };
  }

  set(
    model: string,
    key: string,
    partialInstance: Record<string, {value: unknown; partKeys: string[]}>,
    meta: FieldMeta
  ): FieldSub[] {
    const instanceKey = this.getInstanceKey(model, key);
    let entry = this.cache.get(instanceKey);
    if (!entry) {
      entry = new Map();
      this.cache.set(instanceKey, entry);
    }
    const subs: FieldSub[] = [];
    for (const field in partialInstance) {
      const f = partialInstance[field];
      const oldEntry = entry.get(field);
      const oldValue = oldEntry?.value;
      const newValue = f.value;

      const fieldEntry = {
        value: newValue,
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

      // TODO: add deepEqual
      if (oldValue !== newValue) {
        const fieldKey = getFieldKey(model, key, field);
        const fieldSubs = this.fieldSubscriptions.get(fieldKey);
        if (fieldSubs) subs.push(...fieldSubs);
      }
    }
    return subs;
  }

  setMetaByPartKeys(partKeys: string[], meta: FieldMeta) {
    for (const partKey of partKeys) {
      const fields = this.partKeyToFields.get(partKey);
      if (!fields) continue;
      for (const field of fields) field.meta = meta;
    }
  }
}
