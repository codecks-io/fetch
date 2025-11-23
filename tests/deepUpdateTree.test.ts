import { describe, it, expect } from "vitest";
import { deepUpdateTree } from "../src/_exploration/utils/deepUpdateTree";

type Instance = {
  "~model": string;
  "~key": string;
  [key: string]: string | number | boolean | null | Instance | Instance[];
};

describe("deepUpdateTree", () => {
  describe("no changes", () => {
    it("should return the same reference when instances are identical", () => {
      const prev: Instance = { "~model": "User", "~key": "u1", name: "Alice" };
      const next: Instance = { "~model": "User", "~key": "u1", name: "Alice" };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result).toBe(prev);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should return the same reference for identical nested instances", () => {
      const nested: Instance = { "~model": "Profile", "~key": "p1", bio: "Hello" };
      const prev: Instance = { "~model": "User", "~key": "u1", profile: nested };
      const next: Instance = { "~model": "User", "~key": "u1", profile: nested };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result).toBe(prev);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should return the same reference for identical arrays", () => {
      const items: Instance[] = [
        { "~model": "Item", "~key": "i1", value: 1 },
        { "~model": "Item", "~key": "i2", value: 2 },
      ];
      const prev: Instance = { "~model": "List", "~key": "l1", items };
      const next: Instance = { "~model": "List", "~key": "l1", items };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result).toBe(prev);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });
  });

  describe("structural sharing", () => {
    it("should preserve unchanged field values", () => {
      const prev: Instance = {
        "~model": "User",
        "~key": "u1",
        name: "Alice",
        age: 30,
      };
      const next: Instance = {
        "~model": "User",
        "~key": "u1",
        name: "Alice",
        age: 31,
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.name).toBe(prev.name); // same reference for string
      expect(result.age).toBe(31);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should preserve unchanged nested instance references", () => {
      const unchangedProfile: Instance = { "~model": "Profile", "~key": "p1", bio: "Hello" };
      const prev: Instance = {
        "~model": "User",
        "~key": "u1",
        profile: unchangedProfile,
        name: "Alice",
      };
      const next: Instance = {
        "~model": "User",
        "~key": "u1",
        profile: unchangedProfile,
        name: "Bob",
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.profile).toBe(unchangedProfile);
      expect(result.name).toBe("Bob");
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should preserve unchanged array references", () => {
      const items: Instance[] = [
        { "~model": "Item", "~key": "i1", value: 1 },
        { "~model": "Item", "~key": "i2", value: 2 },
      ];
      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items,
        name: "Old",
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items,
        name: "New",
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.items).toBe(items);
      expect(result.name).toBe("New");
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });
  });

  describe("instance key changes", () => {
    it("should track removed and added when nested instance ~key changes", () => {
      const oldProfile: Instance = { "~model": "Profile", "~key": "p1", bio: "Old" };
      const newProfile: Instance = { "~model": "Profile", "~key": "p2", bio: "New" };
      const prev: Instance = { "~model": "User", "~key": "u1", profile: oldProfile };
      const next: Instance = { "~model": "User", "~key": "u1", profile: newProfile };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.profile).toBe(newProfile);
      expect(removed).toEqual([oldProfile]);
      expect(added).toEqual([newProfile]);
    });

    it("should track removed and added when root instance ~key changes", () => {
      const prev: Instance = { "~model": "User", "~key": "u1", name: "Alice" };
      const next: Instance = { "~model": "User", "~key": "u2", name: "Alice" };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result).toBe(next);
      expect(removed).toEqual([prev]);
      expect(added).toEqual([next]);
    });
  });

  describe("keyed arrays", () => {
    it("should reuse prev array reference for empty arrays", () => {
      const emptyArray: Instance[] = [];
      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: emptyArray,
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.items).toBe(emptyArray); // Should reuse prev empty array
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should preserve unchanged array elements", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };
      const item3: Instance = { "~model": "Item", "~key": "i3", value: 3 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2, item3],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2, item3],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.items).toBe(prev.items);
      expect((result.items as Instance[])[0]).toBe(item1);
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should track added instances in arrays", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.items as Instance[]).length).toBe(2);
      expect((result.items as Instance[])[0]).toBe(item1);
      expect(added).toEqual([item2]);
      expect(removed).toEqual([]);
    });

    it("should track removed instances in arrays", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.items as Instance[]).length).toBe(1);
      expect(removed).toEqual([item2]);
      expect(added).toEqual([]);
    });

    it("should handle reordering without adding changes", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };
      const item3: Instance = { "~model": "Item", "~key": "i3", value: 3 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2, item3],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item3, item1, item2],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.items as Instance[]).length).toBe(3);
      expect((result.items as Instance[])[0]).toBe(item3);
      expect((result.items as Instance[])[1]).toBe(item1);
      expect((result.items as Instance[])[2]).toBe(item2);
      expect(added).toEqual([]); // No instances added or removed, just reordered
      expect(removed).toEqual([]);
    });

    it("should handle insertion in middle efficiently", () => {
      const items = Array.from({ length: 100 }, (_, i) => ({
        "~model": "Item",
        "~key": `i${i}`,
        value: i,
      }));

      const newItem: Instance = { "~model": "Item", "~key": "new", value: 999 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items,
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [...items.slice(0, 50), newItem, ...items.slice(50)],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.items as Instance[]).length).toBe(101);
      expect((result.items as Instance[])[50]).toBe(newItem);
      expect(added).toEqual([newItem]);
      expect(removed).toEqual([]);
      // Verify structural sharing for unchanged elements
      expect((result.items as Instance[])[0]).toBe(items[0]);
      expect((result.items as Instance[])[49]).toBe(items[49]);
      expect((result.items as Instance[])[51]).toBe(items[50]);
    });

    it("should update nested instance fields in array", () => {
      const item1Old: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item1New: Instance = { "~model": "Item", "~key": "i1", value: 2 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1Old, item2],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1New, item2],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.items as Instance[])[0].value).toBe(2);
      expect((result.items as Instance[])[1]).toBe(item2); // Unchanged element preserved
      expect(added).toEqual([]); // No instances added or removed, just field updated
      expect(removed).toEqual([]);
    });

    it("should detect array changes even when no instances added/removed (fast path)", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };
      const item3: Instance = { "~model": "Item", "~key": "i3", value: 3 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2, item3],
      };
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [
          item1,
          { "~model": "Item", "~key": "i2", value: 99 }, // Updated field
          item3,
        ],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      // The array should have a new reference since item2 changed
      expect(result.items).not.toBe(prev.items);
      expect((result.items as Instance[])[0]).toBe(item1); // Preserved
      expect((result.items as Instance[])[1]).not.toBe(item2); // Changed
      expect((result.items as Instance[])[2]).toBe(item3); // Preserved
      expect((result.items as Instance[])[1].value).toBe(99);
      expect(added).toEqual([]); // No instances added or removed
      expect(removed).toEqual([]);
    });

    it("should detect array changes even when no instances added/removed (slow path)", () => {
      const item1: Instance = { "~model": "Item", "~key": "i1", value: 1 };
      const item2: Instance = { "~model": "Item", "~key": "i2", value: 2 };
      const item3: Instance = { "~model": "Item", "~key": "i3", value: 3 };

      const prev: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [item1, item2, item3],
      };
      // Reorder + update to trigger slow path
      const next: Instance = {
        "~model": "List",
        "~key": "l1",
        items: [
          item3,
          { "~model": "Item", "~key": "i2", value: 99 }, // Updated field
          item1,
        ],
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      // The array should have a new reference since item2 changed
      expect(result.items).not.toBe(prev.items);
      expect((result.items as Instance[])[0]).toBe(item3); // Reordered
      expect((result.items as Instance[])[1]).not.toBe(item2); // Changed
      expect((result.items as Instance[])[1].value).toBe(99);
      expect((result.items as Instance[])[2]).toBe(item1); // Reordered
      expect(added).toEqual([]); // No instances added or removed
      expect(removed).toEqual([]);
    });
  });

  describe("nested updates", () => {
    it("should handle deeply nested instance updates", () => {
      const oldInner: Instance = { "~model": "Inner", "~key": "in1", value: "old" };
      const newInner: Instance = { "~model": "Inner", "~key": "in1", value: "new" };

      const prev: Instance = {
        "~model": "Outer",
        "~key": "o1",
        middle: {
          "~model": "Middle",
          "~key": "m1",
          inner: oldInner,
        },
      };
      const next: Instance = {
        "~model": "Outer",
        "~key": "o1",
        middle: {
          "~model": "Middle",
          "~key": "m1",
          inner: newInner,
        },
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect((result.middle as Instance).inner).not.toBe(oldInner);
      expect(((result.middle as Instance).inner as Instance).value).toBe("new");
      expect(added).toEqual([]);
      expect(removed).toEqual([]);
    });

    it("should track nested instance replacement by key", () => {
      const oldInner: Instance = { "~model": "Inner", "~key": "in1", value: "old" };
      const newInner: Instance = { "~model": "Inner", "~key": "in2", value: "new" };

      const prev: Instance = {
        "~model": "Outer",
        "~key": "o1",
        nested: oldInner,
      };
      const next: Instance = {
        "~model": "Outer",
        "~key": "o1",
        nested: newInner,
      };

      const { result, added, removed } = deepUpdateTree(prev, next);

      expect(result.nested).toBe(newInner);
      expect(removed).toEqual([oldInner]);
      expect(added).toEqual([newInner]);
    });
  });
});
