import { ACTIONS } from "../../api-utils/Constant";
import { compareObjects } from "../../api-utils/compareObject";
import CloudLocalbase from "../../localbase";

export async function updateRaw(data) {
  //console.log(data);
  if (!data.db) throw new Error('db no definido');
  if (!data.collection) throw new Error('collection no definido');
  if (!data.action) throw new Error('action no definido');

  const { db, collection, key, action, data: payload } = data;
  const localDb = new CloudLocalbase(db);
  localDb.noChange = true;

  if (action === ACTIONS.ADD) {
    if (!key) throw new Error('key no definido');
    await localDb.collection(collection).add(payload, key);
    console.log('add');
  } else if (action === ACTIONS.DELETE) {
    if (!key) {
      await localDb.collection(collection).delete();
      console.log('delete colección');
    } else {
      await localDb.collection(collection).doc(key).delete();
      console.log('delete doc');
    }
  } else if (action === ACTIONS.UPDATE) {
    try {
      if (!payload.newDocument) throw new Error('newDocument no definido');
      await localDb.collection(collection).doc(key).update(payload.newDocument);
      console.log('update');
    } catch (error) {
      //console.log('error', error);
      await localDb.collection(collection).add(payload.newDocument, key);
      console.log('add to update');
    }
  } else if (action === ACTIONS.SET) {
    await localDb.collection(collection).doc(key).set(payload);
    console.log('set');
  } else if (action === ACTIONS.DROP) {

    if (collection) {

      await localDb.collection(collection).delete();
      console.log('drop collection');
    } else if (db) {
      await localDb.delete();
      console.log('drop db');
    }
  }
}