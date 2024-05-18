import { ACTIONS } from "../../api-utils/Constant";
import CloudLocalbase from "../../localbase";

export async function readRaw(data){
  if (!data.db) throw new Error('db no definido');
  if (!data.collection) throw new Error('collection no definido');
  if (!data.action) throw new Error('action no definido');

  const { db, collection, key, action, data: payload } = data;
  const localDb = new CloudLocalbase(db);
  localDb.noChange = true;
  localDb.config.debug = false;

  if (action === ACTIONS.GET) {
    if (!key) return await localDb.collection(collection).doc(payload).get();
    return await localDb.collection(collection).doc(key).get();
  } else if (action === ACTIONS.GET_ALL) {
    return await localDb.collection(collection).get();
  }else if(action === ACTIONS.GET_WHERE){
    return await localDb.collection(collection).where(payload).get();
  }else if(action === ACTIONS.SEARCH){
    return await localDb.collection(collection).search(payload);
  }else if(action === ACTIONS.COUNT){
    if(payload && typeof payload === 'object'){
      return await localDb.collection(collection).where(payload).count();
    }
    return await localDb.collection(collection).count();
  }
}