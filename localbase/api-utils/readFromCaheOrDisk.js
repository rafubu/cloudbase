import CloudLocalbase from "../localbase";
import inChache, { kche } from "./inChache";

export async function readFromCacheOrDisk( {db, collectionName, lf}, callback ) {
  if(!db || !collectionName) throw new Error('db y collectionName son requeridos');
  if(!lf) throw new Error('lf es requerido');
  if(!callback) throw new Error('callback es requerido');
  if(typeof callback !== 'function') throw new Error('callback debe ser una función');

  // Leer desde la caché si está disponible
  if (inChache(db, collectionName)) {
    const cache = kche(db, collectionName);
    for (const objeto of cache) {
      callback( objeto, objeto._id);
    }
    return;
  }

    const cache = await loadKcheFromDisk(db, collectionName, lf );
    for (const objeto of cache) {
      callback( objeto, objeto._id);
    }
}

export async function loadKcheFromDisk(db, collectionName, lf) {
  if(!CloudLocalbase.cache[db]) CloudLocalbase.cache[db] = {};
    if(!CloudLocalbase.cache[db][collectionName]) CloudLocalbase.cache[db][collectionName] = [];

    CloudLocalbase.cache[db][collectionName] = [];

    await lf[collectionName].iterate(function (value, key){
      CloudLocalbase.cache[db][collectionName].push(value);
    });
    return CloudLocalbase.cache[db][collectionName];
}