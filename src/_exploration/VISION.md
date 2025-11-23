# Data Store Vision

This document compares the original architectural plan with the current implementation state and outlines the roadmap for completing the data store system.

---

## Current State

### ✅ Fully Implemented Components

#### 1. Cache Layer (`immediate-cache.ts`)

The `ImmediateCache` provides a normalized, field-level cache with dependency tracking.

**Features:**
- Three-tier storage: Model → Instance (by ID) → Field
- Each cached value includes:
  - `value`: The actual data
  - `partKeys`: Dependency keys (e.g., `["user:123:name"]`)
  - `meta`: Metadata with state (`"fresh"` | `"dirty"`)
- Bidirectional mapping via `partKeyToFields` for efficient invalidation
- Field-level granularity enables fine-grained cache updates

**Status vs Plan:** ✅ Matches plan specification
- Returns data with fresh/dirty status
- Supports incomplete state (via absence of data)
- Provides efficient invalidation via part keys

#### 2. Loader (`loader.ts`, `api-requester.ts`)

The `BatchedLoader` and `ApiRequester` handle efficient API communication.

**Features:**
- **Request Batching**: Time-based batching (default 10ms window)
- **Deduplication**: Tracks in-flight requests to avoid duplicates
- **Request Merging**: Combines multiple field/relation requests per instance
- **Concurrency Limiting**: Max 3 concurrent API calls (configurable)
- **Promise Coordination**: Returns promises that resolve when batch completes

**Status vs Plan:** ✅ Matches plan specification
- HTTP-based loader with batching
- In-progress request cache prevents duplicate fetches
- Handles out-of-order responses correctly

#### 3. Store (`store.ts`)

The `Store` is the central coordinator combining cache + loader.

**Features:**
- **Cache-first strategy**: Checks cache before loading
- **Recursive query resolution**: Handles nested relations
- **Three-state logic**:
  - All fresh → return immediately
  - All fresh/dirty → return data + optionally reload
  - Any incomplete → load from API
- **Retry mechanism**: Up to 5 iterations if data still missing after load
- **Part-key calculation**: Generates dependency keys for reactive queries

**Status vs Plan:** ✅ Matches plan specification
- Combines cache + loader as designed
- Implements the three-state return logic (fresh/dirty/incomplete)
- Handles error cases with retry logic

#### 4. Reactive Queries (`user-query-manager.ts`)

The `UserQueryManager` manages query subscriptions and invalidation.

**Features:**
- **Query caching**: Reuses query instances via normalized keys
- **Subscription management**: Tracks listeners per query
- **Part-key reactivity**: Queries subscribe to dependency keys
- **Automatic disposal**: Cleans up unused queries
- **Change detection**: `diffResults()` compares part keys to detect changes

**Status vs Plan:** ✅ Core functionality matches plan
- Implements listener-based reactivity
- Part-key based invalidation working
- Queries automatically update on invalidation

#### 5. React Integration (`create-hooks.ts`, `react-hooks.ts`)

Type-safe React hooks with Suspense support.

**Features:**
- `useFetch(model, id, query)`: Fetch single instance
- `useFetchFromRoot(query)`: Fetch from root level
- **Suspense integration**: Uses React's `use()` hook for promises
- **Auto-subscription**: `useSyncExternalStore` handles reactivity
- **Full TypeScript inference**: Type-safe query building

**Status vs Plan:** ✅ Exceeds plan (React integration not in original plan)

#### 6. Utilities

**`ConcurrencyLimiter`** (`utils/concurrency-limiter.ts`)
- Limits concurrent async operations
- Queue management for excess operations
- Used by ApiRequester

**`deepUpdateTree`** (`utils/deepUpdateTree.ts`)
- React-like reconciliation for data trees
- Key-based array reconciliation with structural sharing
- Tracks added/removed instances
- Optimizes by reusing unchanged object references

**Status:** ✅ Implemented but not yet integrated (see Next Steps)

---

## Gaps: Plan vs Reality

### ⚠️ Partially Implemented

#### 1. Invalidation API

**What exists:**
- Core mechanism: `ImmediateCache.setMetaByPartKeys()`
- Reactive propagation: `UserQueryManager.onInvalidation()`

**What's missing:**
The plan specified rich invalidation patterns:
- `field:cards.123.title` - Invalidate specific field
- `field:cards.*.title` - Invalidate field across all instances
- `relation:cards` - Invalidate all relations containing cards
- `instance:card.123` - Invalidate all queries for that instance
- `instance:card.*` - Invalidate when any card is deleted

**Current state:** Part-key mechanism supports these patterns, but:
- No public API to trigger invalidation
- No pattern matching for wildcard keys (`*`)
- No automatic invalidation after mutations

**Priority:** High - needed for mutations to properly invalidate cache

#### 2. Query Optimization

**Issue 1: Query Normalization**
- Current: Uses `JSON.stringify()` for query cache keys (user-query-manager.ts:140)
- Problem: Inconsistent ordering can create duplicate queries
- Needed: Proper query normalization for consistent cache keys

**Issue 2: Tree Diffing**
- Current: `diffResults()` only compares part-key arrays
- Available: `deepUpdateTree` utility is implemented
- Needed: Integration to detect actual data changes, not just dependency changes
- Benefit: Avoid unnecessary re-renders when part keys change but data doesn't

**Priority:** Medium - optimization, not blocking functionality

### ❌ Not Implemented

#### 1. Optimistic Updates

**From the plan:**
> - Is the first tier the store asks
> - A mutation adds a layer to the optimistic store
> - If a mutation succeeds, we commit the changes to the cache and mark entries as dirty
> - If a mutation fails, we roll back the optimistic layer

**Current state:** Completely missing
- No optimistic state management
- No mutation layer system
- No commit/rollback mechanism
- No optimistic relation updates

**Impact:** Users see loading states instead of immediate feedback for mutations

**Priority:** High - critical for good UX

#### 2. Cache Eviction

**From the plan:**
> The cache lives within memory and is synchronous. We might need to include a LRU mechanism to limit memory consumption

**Current state:** Not implemented
- No LRU (Least Recently Used) eviction
- No TTL (Time To Live) support
- No memory limits
- No garbage collection of unused data

**Impact:** Potential memory leaks in long-running applications

**Priority:** Medium - important for production use

#### 3. Multi-tier Loader

**From the plan:**
> The loader might use a multi-tiered approach. It might check (async) for e.g. indexed-db entries before doing a request over the network.

**Current state:** Single-tier HTTP only
- No IndexedDB integration
- No offline support
- No persistence layer

**Impact:** No offline capabilities, all data lost on refresh

**Priority:** Low - nice to have, not critical

---

## Next Steps

### Priority 1: Optimistic Update System

**Goal:** Enable immediate UI updates for mutations with rollback on failure

**Tasks:**
1. Design optimistic layer architecture
   - Stack of mutation layers (one per in-flight mutation)
   - Each layer stores field updates and relation changes
   - Layers are checked before cache in read path
2. Implement `OptimisticStore` class
   - `addLayer(mutationId)`: Create new optimistic layer
   - `updateLayer(mutationId, updates)`: Update optimistic data
   - `commitLayer(mutationId)`: Merge to cache, mark dirty
   - `rollbackLayer(mutationId)`: Discard optimistic changes
3. Update `Store.loadData()` to check optimistic layers first
4. Implement relation updates
   - When item created: add to relevant relation queries
   - When item deleted: remove from all relations (reverse lookup?)
   - When item updated: re-evaluate filters for relation queries

**Files to modify:**
- New: `src/_exploration/optimistic-store.ts`
- Modify: `src/_exploration/store.ts`

### Priority 2: Public Invalidation API

**Goal:** Provide clean API for mutations to invalidate cache

**Tasks:**
1. Implement pattern matching for wildcard keys
   - `field:cards.*.title` matches `field:cards.123.title`
   - `instance:card.*` matches all card instances
2. Create public invalidation API
   - `store.invalidate(patterns: string[])`: Mark part keys as dirty
   - Helper functions: `invalidateField()`, `invalidateRelation()`, `invalidateInstance()`
3. Document invalidation patterns
   - When to use each pattern type
   - How mutations should invalidate
4. Consider smart invalidation
   - If diff available, check if query result actually changes
   - Avoid unnecessary re-fetches

**Files to modify:**
- Modify: `src/_exploration/store.ts`
- Modify: `src/_exploration/user-query-manager.ts`

### Priority 3: Integrate Tree Diffing

**Goal:** Optimize re-renders by detecting actual data changes

**Tasks:**
1. Integrate `deepUpdateTree` into `UserQueryManager.diffResults()`
2. Compare actual data trees, not just part-key arrays
3. Return structural sharing for unchanged subtrees
4. Track which queries need re-render vs. just dependency update

**Files to modify:**
- Modify: `src/_exploration/user-query-manager.ts`

### Priority 4: Improve Query Normalization

**Goal:** Ensure consistent query cache keys

**Tasks:**
1. Replace `JSON.stringify()` with proper normalization
2. Sort object keys deterministically
3. Normalize query structure (e.g., field order shouldn't matter)
4. Consider query fingerprinting/hashing

**Files to modify:**
- Modify: `src/_exploration/user-query-manager.ts`

### Priority 5: Cache Eviction

**Goal:** Prevent unbounded memory growth

**Tasks:**
1. Implement LRU eviction policy
   - Track access time for each cache entry
   - Evict least recently used when limit reached
2. Add configurable memory limits
3. Implement TTL for cache entries
4. Add manual cache clearing API
5. Consider weak references for automatic GC

**Files to modify:**
- Modify: `src/_exploration/immediate-cache.ts`

### Future: Multi-tier Loader

**Goal:** Add offline support and persistence

**Tasks:**
1. Design loader plugin architecture
2. Implement IndexedDB loader tier
3. Add loader priority/fallback system
4. Implement offline queue for mutations
5. Add sync mechanism for offline → online transition

**Files to create:**
- New: `src/_exploration/indexed-db-loader.ts`
- Modify: `src/_exploration/loader.ts`

---

## Architecture Strengths

The current implementation demonstrates several excellent patterns:

1. **Normalized Cache**: Data stored by model/id/field prevents duplication
2. **Part-Key Dependencies**: Fine-grained reactivity with minimal over-fetching
3. **Request Batching**: Automatic optimization of API calls
4. **Structural Sharing**: `deepUpdateTree` enables efficient immutable updates
5. **Type Safety**: Full TypeScript inference throughout
6. **Suspense Integration**: Modern React concurrent rendering support
7. **Separation of Concerns**: Clean boundaries between cache/loader/store/queries

---

## Open Questions

1. **Optimistic Relation Updates**: Should we maintain reverse lookups (instance → queries containing it) to efficiently update relations when items are deleted?

2. **Invalidation Granularity**: How aggressive should wildcard invalidation be? Should `relation:cards` invalidate all card-containing queries or require specific relation names?

3. **Cache Eviction Policy**: Should we use pure LRU, or combine with query subscription (never evict actively subscribed data)?

4. **Multi-layer Optimistic Updates**: Should we support parallel optimistic mutations, or serialize them? How do we handle conflicts?

5. **Error Handling**: Should failed mutations trigger automatic invalidation, or should that be opt-in?

---

## Summary

The data store implementation has a **solid foundation** with:
- Complete read path (cache → loader → API)
- Reactive query system
- Efficient batching and deduplication
- Type-safe React integration

The **critical missing pieces** are:
1. Optimistic updates (for mutation UX)
2. Public invalidation API (for cache consistency)

The **optimization opportunities** are:
1. Tree diffing integration (for performance)
2. Query normalization (for correctness)
3. Cache eviction (for production stability)

Once optimistic updates and invalidation are complete, this will be a production-ready data loading library with excellent developer experience.
