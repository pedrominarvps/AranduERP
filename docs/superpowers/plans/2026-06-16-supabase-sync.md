# Supabase Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Automatic sync between localStorage and Supabase — online uses Supabase with localStorage cache, offline uses localStorage only, auto-sync on reconnect.

**Architecture:** Write-through to localStorage always; if online also upsert to Supabase; on reconnect push dirty tables to Supabase.

**Tech Stack:** TypeScript, Supabase JS client, localStorage

---

### Task 1: Add connection check + sync functions to db.ts

**Files:**
- Modify: `src/services/db.ts`

- [ ] **Step 1: Add connection check and sync queue functions**

Add after the `DBApi` interface, before the `db` object:

```typescript
const SYNC_PENDING_KEY = 'erp_sync_pending';
let _isOnline: boolean | null = null;

async function checkConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const { error } = await supabase.from('company_settings').select('id').limit(1);
    clearTimeout(timeout);
    _isOnline = !error;
    return _isOnline;
  } catch {
    _isOnline = false;
    return false;
  }
}

function getSyncPendingTables(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(SYNC_PENDING_KEY);
  return raw ? JSON.parse(raw) : [];
}

function markSyncPending(tables: string[]) {
  if (typeof window === 'undefined') return;
  const existing = getSyncPendingTables();
  const merged = [...new Set([...existing, ...tables])];
  localStorage.setItem(SYNC_PENDING_KEY, JSON.stringify(merged));
}

function clearSyncPending() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SYNC_PENDING_KEY);
}

async function syncPendingChanges(): Promise<void> {
  if (!supabase) return;
  const tables = getSyncPendingTables();
  if (tables.length === 0) return;
  const online = await checkConnection();
  if (!online) return;

  for (const table of tables) {
    try {
      const localKey = `erp_${table}`;
      const localData = getLocalItem<any[]>(localKey);
      if (localData.length === 0) continue;

      // Upsert all local rows to Supabase
      const BATCH_SIZE = 50;
      for (let i = 0; i < localData.length; i += BATCH_SIZE) {
        const batch = localData.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from(table).upsert(batch);
        if (error) throw error;
      }
    } catch (err) {
      console.warn(`Error syncing table "${table}":`, err);
      return; // Stop on first failure, retry next time
    }
  }

  clearSyncPending();
}
```

- [ ] **Step 2: Add `checkConnection` and `syncPendingChanges` to the DBApi interface**

```typescript
interface DBApi {
  // ... existing methods ...
  checkConnection(): Promise<boolean>;
  syncPendingChanges(): Promise<void>;
}
```

- [ ] **Step 3: Add the two new methods to the `db` object**

After the last existing method (`saveSale`), before the closing `}`:

```typescript
  async checkConnection() {
    return checkConnection();
  },

  async syncPendingChanges() {
    return syncPendingChanges();
  },
```

- [ ] **Step 4: Modify `saveSale` to always write localStorage first**

Replace the current `saveSale` function. The Supabase block stays wrapped in try/catch as before, but now also always writes to localStorage. The Supabase path remains the preferred path; if it fails, the localStorage fallback saves the day and marks sync pending.

- [ ] **Step 5: Modify `saveProduct`, `saveCategory`, `saveCustomer` to always write localStorage first**

Each of these functions currently has:
```
if (supabase) try Supabase upsert
// localStorage fallback
```

Change to:
```
// Always write to localStorage first
const saved = /* existing localStorage logic */

if (supabase) {
  try {
    await supabase.from('...').upsert(saved);
  } catch (err) {
    markSyncPending(['...']);
  }
}

return saved;
```

This means localStorage is always the source of truth. Supabase is updated in the background.

- [ ] **Step 6: Modify `deleteProduct`, `deleteCustomer` similarly**

Same pattern: always delete from localStorage first, then try Supabase. If Supabase fails, mark sync pending.

- [ ] **Step 7: Modify read functions to prefer Supabase when online**

For `getProducts`, `getCustomers`, `getCategories`, `getSettings`, `getSales`:
- If supabase exists: try to fetch from Supabase; if success, update localStorage cache and return Supabase data
- If Supabase fails or doesn't exist: read from localStorage

This ensures reads always get the latest data (from server if online, from cache if offline).

- [ ] **Step 8: Verify build**

Run: `npx next build`
Expected: Compiles successfully

### Task 2: Integrate sync in AppContext

**Files:**
- Modify: `src/lib/contexts/AppContext.tsx`

- [ ] **Step 1: Call `syncPendingChanges` after `loadAllData`**

In AppContext's `loadAllData`, after the try/catch:

```typescript
const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, p, c, cust, sl] = await Promise.all([
        db.getSettings(), db.getProducts(), db.getCategories(),
        db.getCustomers(), db.getSales(),
      ]);
      setSettings(s);
      setProducts(p);
      setCategories(c);
      setCustomers(cust);
      setSales(sl as Sale[]);
      // Sync pending changes after loading fresh data
      db.syncPendingChanges().catch(console.error);
    } catch (err) {
      console.error('Error al cargar datos base:', err);
    } finally {
      setLoading(false);
    }
  }, []);
```

- [ ] **Step 2: Verify build**

Run: `npx next build`
Expected: Compiles successfully
