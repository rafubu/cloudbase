"use strict"
import localForage from "localforage";
import { increment, arrayRemove, arrayUnion } from './api/actions/preactions.js'

// import api methods
import collection from './api/selectors/collection.js'
import doc from './api/selectors/doc.js'

//filter
import orderBy from './api/filters/orderBy.js'
import limit from './api/filters/limit.js'
import contains from './api/filters/contains.js'

import get from './api/actions/get.js'
import add from './api/actions/add.js'
import update from './api/actions/update.js'
import set from './api/actions/set.js'
import deleteIt from './api/actions/delete.js'
import search from './api/actions/search.js'
import uid from './api-utils/uid.js'
import where from './api/filters/where.js'

// observer
import on from './api/observer/on.js'
import off from './api/observer/off.js'

import mitt from 'mitt'
import { ACTIONS } from "./api-utils/Constant.js";
import updateCache from "./api-utils/updateCache.js";

export default class CloudLocalbase {
  static nodeId = null
  static isCloud = false

  static iDB = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'localbase',
    storeName: 'internal'
  });

  static transacciones = localForage.createInstance({
    driver: localForage.INDEXEDDB,
    name: 'localbase',
    storeName: 'transacciones'
  });

  static events = mitt();

  static cache = {}
  static times = {}

  constructor(dbName) {

    if (CloudLocalbase.isCloud && !CloudLocalbase.nodeId) throw new Error('nodeId no definido');

    // properties
    this.dbName = dbName
    this.nodeId = CloudLocalbase.nodeId

    this.lf = {} // where we store our localForage instances
    this.collectionName = null
    this.orderByProperty = null
    this.orderByDirection = null
    this.limitBy = null
    this.docSelectionCriteria = null
    this.noChange = false;

    this.containsProperty = null
    this.containsValue = null
    this.containsExact = false
    this.containsSinError = false
    this.whereArguments = []

    // queues
    this.deleteCollectionQueue = {
      queue: [],
      running: false
    }


    // config
    this.config = {
      debug: true
    }

    // user errors - e.g. wrong type or no value passed to a method
    this.userErrors = []

    // api - selectors
    this.collection = collection.bind(this)
    this.doc = doc.bind(this)

    // api - filters
    this.orderBy = orderBy.bind(this)
    this.limit = limit.bind(this)
    this.contains = contains.bind(this)
    this.where = where.bind(this);

    // api - actions
    this.get = get.bind(this)
    this.add = add.bind(this)
    this.update = update.bind(this)
    this.set = set.bind(this);
    this.delete = deleteIt.bind(this);

    // api - observer
    this.on = on.bind(this)
    this.off = off.bind(this)

    this.search = search.bind(this);

    //util - uid
    this.uid = uid.bind(this);
  }

  change( collection, action, data, key ) {

    //console.log('change localbase', collection, action, data, key);

    if (!!key) {
      CloudLocalbase.events.emit(`doc:${key}`, { action, data });
      updateCache(this.dbName, collection, key, action, data);
    }

    CloudLocalbase.events.emit(`db:${this.dbName}:col:${collection}`, { key, action, data });

    if (!this.noChange) {
      CloudLocalbase.transacciones.setItem(CloudLocalbase.uid(), JSON.stringify({ db: this.dbName, collection, key, action, data, ts: Date.now() })).finally(() => {
        CloudLocalbase.events.emit('change', { db: this.dbName, collection, key, action, data });
      });
    }
  }

  static increment = increment
  static arrayUnion = arrayUnion
  static arrayRemove = arrayRemove

  static toTimestamp() {
    return Date.now();
  }

  static async update(data) {
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
        const doc = await localDb.collection(collection).doc(key).get();
        if (!doc) throw new Error('doc no encontrado');

        const dbResult = [doc, payload.newDocument];

        // Resolver conflictos y obtener el objeto más reciente
        const resolvedObject = dbResult.reduce((prev, current) => {
          return compareObjects(prev, current) > 0 ? prev : current;
        });

        await localDb.collection(collection).doc(key).update(resolvedObject);
        console.log('update');
      } catch (error) {
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

  static async read( data ){
    if (!data.db) throw new Error('db no definido');
    if (!data.collection) throw new Error('collection no definido');
    if (!data.action) throw new Error('action no definido');

    const { db, collection, key, action, data: payload } = data;

    const localDb = new CloudLocalbase(db);
    localDb.noChange = true;

    if (action === ACTIONS.GET) {
      if (!key) return await localDb.collection(collection).doc(payload).get();
      return await localDb.collection(collection).doc(key).get();
    } else if (action === ACTIONS.GET_ALL) {
      return await localDb.collection(collection).get();
    }else if(action === ACTIONS.GET_WHERE){
      return await localDb.collection(collection).where(payload).get();
    }else if(action === ACTIONS.SEARCH){
      return await localDb.collection(collection).search(payload);
    }

  }

  static uid = uid

  static toDateString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
}