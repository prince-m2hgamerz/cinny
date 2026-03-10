import { createClient, MatrixClient, IndexedDBStore, IndexedDBCryptoStore } from 'matrix-js-sdk';

import { cryptoCallbacks } from './secretStorageKeys';
import { clearNavToActivePathStore } from '../app/state/navToActivePath';
import { pushSessionToSW } from '../sw-session';

type Session = {
  baseUrl: string;
  accessToken: string;
  userId: string;
  deviceId: string;
};

const SYNC_STORE_NAME = 'web-sync-store';
const CRYPTO_STORE_NAME = 'crypto-store';

export const isCryptoStoreSchemaTooNewError = (error: unknown): boolean =>
  error instanceof Error &&
  /schema version of the crypto store is too new/i.test(error.message);

const deleteDatabase = (dbName: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const req = window.indexedDB.deleteDatabase(dbName);

    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error ?? new Error(`Failed to delete IndexedDB "${dbName}"`));
    req.onblocked = () =>
      reject(new Error(`Reset blocked while deleting IndexedDB "${dbName}". Close other VChat tabs and retry.`));
  });

const resetAppIndexedDbStores = async () => {
  await Promise.all([deleteDatabase(SYNC_STORE_NAME), deleteDatabase(CRYPTO_STORE_NAME)]);
};

const createMatrixClient = (session: Session) => {
  const indexedDBStore = new IndexedDBStore({
    indexedDB: global.indexedDB,
    localStorage: global.localStorage,
    dbName: SYNC_STORE_NAME,
  });

  const legacyCryptoStore = new IndexedDBCryptoStore(global.indexedDB, CRYPTO_STORE_NAME);

  const mx = createClient({
    baseUrl: session.baseUrl,
    accessToken: session.accessToken,
    userId: session.userId,
    store: indexedDBStore,
    cryptoStore: legacyCryptoStore,
    deviceId: session.deviceId,
    timelineSupport: true,
    cryptoCallbacks: cryptoCallbacks as any,
    verificationMethods: ['m.sas.v1'],
  });

  return {
    mx,
    indexedDBStore,
  };
};

export const initClient = async (session: Session): Promise<MatrixClient> => {
  const init = async (resetOnSchemaError: boolean): Promise<MatrixClient> => {
    const { mx, indexedDBStore } = createMatrixClient(session);

    try {
      await indexedDBStore.startup();
      await mx.initRustCrypto();
      mx.setMaxListeners(50);
      return mx;
    } catch (error) {
      await indexedDBStore.destroy().catch(() => undefined);

      if (resetOnSchemaError && isCryptoStoreSchemaTooNewError(error)) {
        await resetAppIndexedDbStores();
        return init(false);
      }

      throw error;
    }
  };

  return init(true);
};

export const startClient = async (mx: MatrixClient) => {
  await mx.startClient({
    lazyLoadMembers: true,
  });
};

export const clearCacheAndReload = async (mx: MatrixClient) => {
  mx.stopClient();
  clearNavToActivePathStore(mx.getSafeUserId());
  await mx.store.deleteAllData();
  window.location.reload();
};

export const logoutClient = async (mx: MatrixClient) => {
  pushSessionToSW();
  mx.stopClient();
  try {
    await mx.logout();
  } catch {
    // ignore if failed to logout
  }
  await mx.clearStores();
  window.localStorage.clear();
  window.location.reload();
};

export const clearLoginData = async () => {
  const dbs = await window.indexedDB.databases();

  dbs.forEach((idbInfo) => {
    const { name } = idbInfo;
    if (name) {
      window.indexedDB.deleteDatabase(name);
    }
  });

  window.localStorage.clear();
  window.location.reload();
};
