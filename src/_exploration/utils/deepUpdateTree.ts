type Field = number | string | boolean | null; // yes in theory, they could also contain jsonb data like arrays or objects, but it's enough to compare those via `===` as we assume the cache will do an equality check

interface Instance {
  "~model": string;
  "~key": string;
  [key: string]: Field | Instance | Instance[];
}

export type DeepUpdateResult<T> = {
  result: T;
  added: Instance[];
  removed: Instance[];
};

/**
 * Reconciles two arrays using key-based matching (similar to React's reconciliation).
 * Assumes all elements have a `~key` property - caller must verify this before calling.
 * Returns the new array with structural sharing for unchanged elements.
 */
export function reconcileKeyedArray(
  prevArray: Instance[],
  nextArray: Instance[],
  update: (prev: Instance, next: Instance) => Instance,
  added: Instance[],
  removed: Instance[]
): Instance[] {
  // Fast path: check if keys are unchanged (same length and same keys in same order)
  if (prevArray.length === nextArray.length) {
    let keysUnchanged = true;
    for (let i = 0; i < prevArray.length; i++) {
      if (prevArray[i]["~key"] !== nextArray[i]["~key"]) {
        keysUnchanged = false;
        break;
      }
    }

    if (keysUnchanged) {
      // Keys are unchanged, just update elements in place
      const result: Instance[] = [];
      let hasChanges = false;
      for (let i = 0; i < nextArray.length; i++) {
        const updated = update(prevArray[i], nextArray[i]) as Instance;
        result.push(updated);
        if (updated !== prevArray[i]) hasChanges = true;
      }

      if (!hasChanges) return prevArray;
      return result;
    }
  }

  // Slow path: keys have changed (additions, removals, or reordering)
  // Build maps of elements by key
  const prevByKey = new Map<string, Instance>(prevArray.map((i) => [i["~key"], i]));
  const nextByKey = new Map<string, Instance>(nextArray.map((i) => [i["~key"], i]));

  // Process next array in order
  const result: Instance[] = [];
  for (const nextItem of nextArray) {
    const key = nextItem["~key"];
    if (prevByKey.has(key)) {
      // Element exists in both - update it
      const prevItem = prevByKey.get(key)!;
      const updated = update(prevItem, nextItem) as Instance;
      result.push(updated);
    } else {
      // Element is new - added
      added.push(nextItem);
      result.push(nextItem);
    }
  }

  // Find removed elements (in prev but not in next)
  for (const [key, value] of prevByKey) {
    if (!nextByKey.has(key)) {
      removed.push(value);
    }
  }

  // Always return result in slow path (either has reference changes, adds/removes, or reordering)
  return result;
}

function isInstance(value: unknown): value is Instance {
  return typeof value === "object" && value !== null && "~key" in value;
}

export function deepUpdateTree<T extends Instance>(prev: T, next: T): DeepUpdateResult<T> {
  const added: Instance[] = [];
  const removed: Instance[] = [];

  function update(prevVal: Instance, nextVal: Instance): Instance {
    // If they're identical by reference, reuse the prev reference
    if (prevVal === nextVal) return prevVal;

    // If ~key changed, it's a different instance - remove old, add new
    if (prevVal["~key"] !== nextVal["~key"]) {
      removed.push(prevVal);
      added.push(nextVal);
      return nextVal;
    }

    // Same instance (~key matches), check each field
    let hasChanges = false;
    const result: Instance = {
      "~model": prevVal["~model"],
      "~key": prevVal["~key"],
    };

    // Assuming same shape, iterate over nextVal keys
    for (const key in nextVal) {
      if (key === "~model" || key === "~key") continue;

      const prevField = prevVal[key];
      const nextField = nextVal[key];

      // If references are the same, reuse
      if (prevField === nextField) {
        result[key] = prevField;
        continue;
      }

      // Check if it's an array of instances
      if (Array.isArray(prevField) && Array.isArray(nextField)) {
        if (prevField.length === 0 && nextField.length === 0) {
          result[key] = prevField;
          continue;
        }
        // Check if it's an instance array
        const isInstanceArray = isInstance(prevField[0]) && isInstance(nextField[0]);

        if (isInstanceArray) {
          const reconciled = reconcileKeyedArray(
            prevField as Instance[],
            nextField as Instance[],
            update,
            added,
            removed
          );
          result[key] = reconciled;
          if (reconciled !== prevField) {
            hasChanges = true;
          }
          continue;
        }
        // Non-instance arrays: use reference equality
        result[key] = nextField;
        if (prevField !== nextField) hasChanges = true;
        continue;
      }

      // Check if it's a nested instance
      if (isInstance(prevField) && isInstance(nextField)) {
        const updated = update(prevField, nextField);
        result[key] = updated;
        if (updated !== prevField) hasChanges = true;
        continue;
      }

      // Plain field (primitive)
      result[key] = nextField;
      if (prevField !== nextField) hasChanges = true;
    }

    return hasChanges ? result : prevVal;
  }

  const result = update(prev, next) as T;

  return {result, added, removed};
}
