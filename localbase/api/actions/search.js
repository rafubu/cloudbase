import logger from "../../utils/logger.js"
import reset from '../../api-utils/reset.js'
import selectionLevel from '../../api-utils/selectionLevel.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import { go } from 'fuzzysort';
import CloudLocalbase from "../../localbase.js";
import inChache, { kche } from "../../api-utils/inChache.js";
import { loadKcheFromDisk } from "../../api-utils/readFromCaheOrDisk.js";

/**
 * 
 * @param {string} query  text to search within the collection
 * @param {Array} inKeys properties of the object where to search eg: ['title','category']
 * @param {object} options { highlights:true }
 * @returns [...any] search results in order
 */

export default async function search(query = '',inKeys =[], options = { highlights:true }) {

  if (!query) return logger.error.call(this, 'query in search is empty');
  if (typeof options !== 'object') return logger.error.call(this, 'no valid options');

  this.buscar = async () => {
    console.time('buscar')
    let dbName = this.dbName;
    let collectionName = this.collectionName;

    if(!CloudLocalbase.times[dbName]) CloudLocalbase.times[dbName] = {}
    if(!CloudLocalbase.times[dbName][collectionName]) CloudLocalbase.times[dbName][collectionName] = 0;

    if(inChache(dbName, collectionName)){
      clearTimeout(CloudLocalbase.times[dbName][collectionName])
    } else {
      if(!CloudLocalbase.times[dbName]) CloudLocalbase.times[dbName] = {}
      console.time('cargando_cache')
      await loadKcheFromDisk(dbName, collectionName, this.lf)
      console.timeEnd('cargando_cache')
    }

    CloudLocalbase.times[dbName][collectionName] = setTimeout(()=>{
      delete CloudLocalbase.cache[dbName][collectionName]
      delete CloudLocalbase.times[dbName][collectionName];
    }, 1000 * 60 * 60 )
    
    const optionsFuzzy = {
      limit: 20, // don't return more results than you need!
      threshold: -10000, // don't return bad results
      key: Array.isArray(inKeys) && inKeys.length ? null : '_prepared_',
      keys: Array.isArray(inKeys) && inKeys.length ? inKeys : null
    }

    const results = go(query, kche( dbName, collectionName ), optionsFuzzy);
    logger.log.call(this, 'SEARCHS', results.length);
    console.timeEnd('buscar')
    reset.call(this);
    return results.map(o => o.obj && o.obj.data ? o.obj.data : o.obj);
  }

  // check for user errors
  if (!(typeof options == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .search() must be an object. Not an array, string, number or boolean. The object must contain a "highlights" property set to true or false, e.g. { highlights: true }')
  }
  else {
    if (!options.hasOwnProperty('highlights')) {
      this.userErrors.push('Object passed to search() method must contain a "highlights" property set to boolean true or false, e.g. { highlights: true }')
    }
    else {
      if (typeof options.highlights !== 'boolean') {
        this.userErrors.push('Property "highlights" passed into search() method must be assigned a boolean value (true or false). Not a string or integer.')
      }
    }
  }

  let currentSelectionLevel = selectionLevel.call(this)

  if (currentSelectionLevel == 'collection') {
    return this.buscar();
  }
  else if (currentSelectionLevel == 'doc') {
    this.userErrors.push('Function no avalible in doc')
  }
  if (this.userErrors.length) {
    showUserErrors.call(this)
    return null
  }

}