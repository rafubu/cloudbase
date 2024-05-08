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

export default class CloudLocalbase {

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

  static events = mitt()
  constructor(dbName) {

    // properties
    this.dbName = dbName

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
      debug: false
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

    this.cache = {}
    this.time = 0

    this.search = search.bind(this);

    //util - uid
    this.uid = uid.bind(this);
  }

  change(collection, action, data, key) {

    //console.log('change localbase', collection, action, data, key);

    if (!!key) {
      CloudLocalbase.events.emit(`doc:${key}`, { action, data })
    }

    CloudLocalbase.events.emit(`db:${this.dbName}:col:${collection}`, { key, action, data });

    CloudLocalbase.transacciones.setItem(CloudLocalbase.uid(), JSON.stringify({ db:this.dbName, collection, key, action, data })).finally(() => {
      if(!this.noChange) {
        CloudLocalbase.events.emit('change', { db:this.dbName, collection, key, action, data });
      }
    });
  }

  static increment = increment
  static arrayUnion = arrayUnion
  static arrayRemove = arrayRemove

  static toTimestamp() {
    return Date.now();
  }

  static async update(data){
    //console.log(data);
    if(!data.db) throw new Error('db no definido');
    if(!data.collection) throw new Error('collection no definido');
    if(!data.action) throw new Error('action no definido');

    const { db, collection, key, action, data:payload } = data;
    const localDb = new CloudLocalbase(db);
    localDb.noChange = true;
      if(action === ACTIONS.ADD){
        await localDb.collection(collection).add(payload);
        console.log('add');
      }else if(action === ACTIONS.DELETE){
        if(!key){
          await localDb.collection(collection).delete();
          console.log('delete');
        }else {
          await localDb.collection(collection).doc(key).delete();
          console.log('delete doc');
        }
      }else if(action === ACTIONS.UPDATE){
        try {
          if(!payload.newDocument) throw new Error('newDocument no definido');
          await localDb.collection(collection).doc(key).update(payload.newDocument);
          console.log('update');
        } catch (error) {
          await localDb.collection(collection).add(payload.newDocument, key);
          console.log('add to update');
        }
      }else if(action === ACTIONS.SET){
       await localDb.collection(collection).doc(key).set(payload);
       console.log('set');
      }else if(action === ACTIONS.DROP){

        if(collection){

          await localDb.collection(collection).delete();
          console.log('drop collection');
        }else if(db){
          await localDb.delete();
          console.log('drop db');
        }
      }  
  }

  static uid = uid

  static toDateString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
}