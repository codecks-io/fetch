import type {FieldCache, FieldMeta} from "./immediate-cache";
import {getFieldKey} from "./immediate-cache";

/**
 * Represents a single optimistic update layer
 * Contains field updates for one mutation
 * Internal implementation - wrapped by ImmediateCache to provide full OptimisticUpdater interface
 */
export class OptimisticLayer {
  private data = new Map<string, any>();
  private affectedFields = new Set<string>();

  setField(model: string, id: string, field: string, value: any): void {
    const fieldKey = getFieldKey(model, id, field);
    this.data.set(fieldKey, value);
    this.affectedFields.add(fieldKey);
  }

  hasChanges(): boolean {
    return this.affectedFields.size > 0;
  }

  getAffectedFieldKeys(): Iterable<string> {
    return this.affectedFields;
  }

  entries(): IterableIterator<[string, any]> {
    return this.data.entries();
  }
}

interface FlatViewEntry {
  value: any;
  layerIndex: number;
}

/**
 * Manages a stack of optimistic layers with O(1) lookups
 *
 * Design:
 * - Maintains a stack of layers (one per in-flight mutation)
 * - Rebuilds flattened view when layers added/removed for fast reads
 * - Later layers override earlier ones (parallel updates supported)
 * - Auto-cleanup via promise lifecycle
 */
export class OptimisticManager {
  private layers: OptimisticLayer[] = [];
  private flatView = new Map<string, FlatViewEntry>();

  /**
   * Add a new optimistic layer
   * @returns Object with the layer and a dispose function that returns affected field keys
   */
  addLayer(): {layer: OptimisticLayer; dispose: () => void} {
    const layer = new OptimisticLayer();
    this.layers.push(layer);
    const dispose = () => this.removeLayer(layer);
    return {layer, dispose};
  }

  /**
   * Get optimistic value for a field (O(1) via flat view)
   * Returns undefined if no optimistic update exists for this field
   */
  get(model: string, id: string, field: string): FieldCache | undefined {
    const fieldKey = getFieldKey(model, id, field);
    const entry = this.flatView.get(fieldKey);

    if (!entry) return undefined;

    // Return as FieldCache with optimistic metadata
    const meta: FieldMeta = {
      state: "optimistic",
    };

    return {
      value: entry.value,
      partKeys: [fieldKey], // Use simple partKey for now
      meta,
    };
  }

  /**
   * Remove a layer from the stack
   * Returns affected field keys for notification
   */
  private removeLayer(layer: OptimisticLayer): void {
    const layerIndex = this.layers.indexOf(layer);
    if (layerIndex === -1) return;

    this.layers.splice(layerIndex, 1);
    this.rebuildFlatView();
  }

  /**
   * Rebuild the flattened view from the layer stack
   * Later layers override earlier ones for the same field
   */
  rebuildFlatView(): void {
    this.flatView.clear();

    // Iterate through layers - later layers override earlier ones
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      for (const [fieldKey, value] of layer.entries()) {
        this.flatView.set(fieldKey, {
          value,
          layerIndex: i,
        });
      }
    }
  }
}
