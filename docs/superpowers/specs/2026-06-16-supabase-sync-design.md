# Supabase Auto-Sync Design

## Goal
Automatic bidirectional sync between localStorage and Supabase: online → Supabase is primary with localStorage cache; offline → localStorage only; auto-sync on reconnect.

## Architecture

### Data Flow
```
Write:  localStorage (always) → if online: Supabase upsert (same step)
Read:   if online: Supabase → cache in localStorage → return
        if offline: localStorage → return
Sync:   on loadAllData() + periodic check: if sync_pending flag set, upsert dirty tables to Supabase
```

### Connection Detection
- `checkConnection()`: lightweight `SELECT id FROM company_settings LIMIT 1` with 3s timeout
- Result cached in module-level `isOnline` variable
- Checked before each Supabase operation; if false, skip Supabase entirely

### Sync Queue (Flag-based)
- `erp_sync_pending`: JSON array of table names with pending changes
- Set when a write operation fails on Supabase (connection lost)
- Processed in `syncPendingChanges()`: for each dirty table, read all rows from localStorage, upsert to Supabase
- Cleared on successful sync

### Modified Functions (in db.ts)
| Function | Change |
|----------|--------|
| `checkConnection()` | New: returns boolean |
| `syncPendingChanges()` | New: processes dirty tables |
| `getSettings()`, `getProducts()`, etc. | Prefer Supabase when online, cache in localStorage |
| `saveProduct()`, `saveCustomer()`, etc. | Always write to localStorage first; if online, also upsert to Supabase; if upsert fails, add to sync queue |
| `deleteProduct()`, `deleteCustomer()`, etc. | Same pattern: localStorage + online Supabase |

### AppContext Integration
- `loadAllData()` calls `syncPendingChanges()` after loading data
- Network status changes detected on each operation (no event listeners needed)

### Files Changed
- `src/services/db.ts` — core sync logic
- `src/lib/contexts/AppContext.tsx` — call sync on load
