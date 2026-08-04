import { openDB } from 'idb';
import { api } from './api/client';

const DB_NAME = 'NeuroSignal_Offline_DB';
const STORE_NAME = 'pending_sync';

export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const queueForSync = async (type: string, data: any) => {
  const db = await initDB();
  await db.add(STORE_NAME, {
    type,
    data,
    timestamp: new Date().toISOString(),
  });

  // Try immediate sync if online
  if (navigator.onLine) {
    syncAll();
  }
};

export const syncAll = async () => {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const items = await store.getAll();

  for (const item of items) {
    try {
      if (item.type === 'PATIENT_ADMISSION') {
        await api.patients.syncSQL(item.data);
      } else if (item.type === 'SESSION_DATA') {
        await api.patients.syncSessionSQL(item.data);
      }

      // If successful, remove from queue
      await store.delete(item.id);
      console.log(`Synced item ${item.id} of type ${item.type}`);
    } catch (error) {
      console.error(`Failed to sync item ${item.id}`, error);
    }
  }
};

// Listen for online event to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncAll);
}
