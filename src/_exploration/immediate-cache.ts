import type {MissingDataRequest} from "./loader-types";
import {OptimisticLayer, OptimisticManager} from "./optimistic-manager";

export type FieldMeta = {state: "optimistic"} | {state: "fresh"} | {state: "dirty"};

export interface FieldCache<T = any> {
  value: T;
  partKeys: string[];
  meta: FieldMeta;
}

type FieldLocation = {
  model: string;
  id: string;
  field: string;
  fieldKey: string;
  cache: FieldCache;
};

type ModelInstance = Map<string, FieldCache>;

type ModelCache = Map<string, ModelInstance>;

type FieldSub = () => void;

export const getFieldKey = (model: string, id: string, field: string) => `${model}:${id}:${field}`;

/**
 * Wrapper that provides full OptimisticUpdater interface
 * Delegates writes to OptimisticLayer and reads to ImmediateCache
 */
export class OptimisticUpdater {
  constructor(
    private layer: OptimisticLayer, // OptimisticLayer from optimistic-manager
    private cache: ImmediateCache
  ) {}

  setField(model: string, id: string, field: string, value: any): void {
    this.layer.setField(model, id, field, value);
  }

  getField(model: string, id: string, field: string): FieldCache | undefined {
    return this.cache.get(model, id, field);
  }
}

export class ImmediateCache {
  cache: ModelCache = new Map<string, ModelInstance>();
  partKeyToFields = new Map<string, FieldLocation[]>();
  private fieldSubscriptions = new Map<string, Set<FieldSub>>();
  private optimisticManager = new OptimisticManager();

  private getInstanceKey(model: string, id: string): string {
    return `${model}:${id}`;
  }

  get(model: string, key: string, field: string): FieldCache | undefined {
    // Check optimistic layer first
    const optimistic = this.optimisticManager.get(model, key, field);
    if (optimistic) return optimistic;

    // Fall through to base cache
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
      const fieldKey = getFieldKey(model, key, field);
      entry.set(field, fieldEntry);
      for (const partKey of f.partKeys) {
        const location: FieldLocation = {
          model,
          id: key,
          field,
          fieldKey,
          cache: fieldEntry,
        };
        const maybeFields = this.partKeyToFields.get(partKey);
        if (!maybeFields) {
          this.partKeyToFields.set(partKey, [location]);
        } else {
          maybeFields.push(location);
        }
      }

      // TODO: add deepEqual
      if (oldValue !== newValue) {
        const fieldSubs = this.fieldSubscriptions.get(fieldKey);
        if (fieldSubs) subs.push(...fieldSubs);
      }
    }
    return subs;
  }

  setMetaByPartKeys(partKeys: string[], meta: FieldMeta): MissingDataRequest[] {
    const subscribedFields: MissingDataRequest[] = [];
    for (const partKey of partKeys) {
      const locations = this.partKeyToFields.get(partKey);
      if (!locations) continue;
      for (const location of locations) {
        location.cache.meta = meta;

        if (this.fieldSubscriptions.has(location.fieldKey)) {
          subscribedFields.push({
            type: "field",
            model: location.model,
            id: location.id,
            field: location.field,
          });
        }
      }
    }
    return subscribedFields;
  }

  /**
   * Create a new optimistic layer bound to a promise and apply updates
   * The layer will be automatically removed when the promise settles
   * @param promise - Promise to bind the layer lifecycle to
   * @param updateFn - Function to apply optimistic updates to the layer
   * @returns The updater object with both read and write capabilities
   */
  createOptimisticLayer(
    promise: Promise<any>,
    updateFn: (updater: OptimisticUpdater) => void
  ): OptimisticUpdater {
    const {layer, dispose} = this.optimisticManager.addLayer();

    // Create wrapper that provides both read and write capabilities
    const updater = new OptimisticUpdater(layer, this);

    // Apply updates and notify subscribers
    updateFn(updater);

    // Only rebuild flat view if any changes were made
    if (layer.hasChanges()) {
      this.optimisticManager.rebuildFlatView();
      const affectedFields = layer.getAffectedFieldKeys();
      const notify = () => {
        const subs: FieldSub[] = [];
        for (const fieldKey of affectedFields) {
          const fieldSubs = this.fieldSubscriptions.get(fieldKey);
          if (fieldSubs) subs.push(...fieldSubs);
        }
        new Set(subs).forEach((fn) => fn());
      };
      notify();
      promise.finally(() => {
        dispose();
        notify();
      });
    } else {
      promise.finally(() => {
        dispose();
      });
    }

    return updater;
  }
}
