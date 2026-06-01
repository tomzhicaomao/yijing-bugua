import { openDB, type IDBPDatabase } from 'idb'

const DB_NAME = 'yijing-bugua'
export const DB_VERSION = 1
const STORE_NAME = 'records'

let dbPromise: Promise<IDBPDatabase> | null = null

export function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp')
        store.createIndex('category', 'category')
        store.createIndex('feedbackStatus', 'feedback.status')
        store.createIndex('feedbackDueAt', 'feedback.dueAt')
        store.createIndex('schemaVersion', 'schemaVersion')
      },
    }).catch((err) => {
      dbPromise = null
      throw err
    })
  }
  return dbPromise
}

/** For testing: reset the DB connection */
export function resetDB(): void {
  dbPromise = null
}
