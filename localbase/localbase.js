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

// actions
import get from './api/actions/get.js'
import add from './api/actions/add.js'
import update from './api/actions/update.js'
import set from './api/actions/set.js'
import deleteIt from './api/actions/delete.js'
import search from './api/actions/search.js'
import where from './api/filters/where.js'
import backup from "./api/actions/backup.js";

//util
import uid from './api-utils/uid.js'

// observer
import on from './api/observer/on.js'
import off from './api/observer/off.js'

// events
import mitt from 'mitt'
import updateCache from "./api-utils/updateCache.js";
import { updateRaw } from "./api/actions/updateRaw.js";
import { readRaw } from "./api/actions/readRaw.js";
import porPage from "./api/pagination/porPage.js";
import page from "./api/pagination/page.js";
import count from "./api/actions/count.js";

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
    this.porPag = Infinity;
    this.currentPage = 0;
    this.whereArguments = []
    this.whereCount = 0

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
    this.search = search.bind(this);
    this.count = count.bind(this);

    // api - observer
    this.on = on.bind(this)
    this.off = off.bind(this)

    // api - pagination
    this.porPage = porPage.bind(this);
    this.page = page.bind(this);

    //util - uid
    this.uid = uid.bind(this);
  }

  change(collection, action, data, key) {
    if (!!key) {
      CloudLocalbase.events.emit(`doc:${key}`, { action, data });
      updateCache(this.dbName, collection, key, action, data);
    }

    CloudLocalbase.events.emit(`db:${this.dbName}:col:${collection}`, { key, action, data });

    if (!this.noChange) {
      CloudLocalbase.transacciones.setItem(CloudLocalbase.uid(), { db: this.dbName, collection, key, action, data, ts: Date.now() }).finally(() => {
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

  static update = updateRaw

  static read = readRaw

  static uid = uid

  static backup = backup;

  static toDateString(timestamp) {
    return new Date(timestamp).toLocaleDateString();
  }
}