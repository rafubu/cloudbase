import { ACTIONS } from "../../api-utils/Constant";
import CloudLocalbase from "../../localbase";

export async function updateRaw(data) {
  if (!data.db) throw new Error('db no definido');
  if (!data.collection) throw new Error('collection no definido');
  if (!data.action) throw new Error('action no definido');

  const { db, collection, key, action, data: payload } = data;
  const localDb = new CloudLocalbase(db);
  localDb.noChange = true;
  localDb.config.debug = false;

  if (action === ACTIONS.ADD) {
    if (!key) throw new Error('key no definido');
    await localDb.collection(collection).add(payload, key);
  } else if (action === ACTIONS.DELETE) {
    if (!key) {
      await localDb.collection(collection).delete();
    } else {
      await localDb.collection(collection).doc(key).delete();
    }
  } else if (action === ACTIONS.UPDATE) {
    try {
      if (!payload.newDocument) throw new Error('newDocument no definido');
      await localDb.collection(collection).doc(key).update(payload.newDocument);
    } catch (error) {
      await localDb.collection(collection).add(payload.newDocument, key);
    }
  } else if (action === ACTIONS.SET) {
    await localDb.collection(collection).doc(key).set(payload);
  } else if (action === ACTIONS.DROP) {

    if (collection) {
      await localDb.collection(collection).delete();
    } else if (db) {
      await localDb.delete();
    }
  }
}