import isSubset from '../../utils/isSubset.js'
import logger from "../../utils/logger.js"
import reset from '../../api-utils/reset.js'
import selectionLevel from '../../api-utils/selectionLevel.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import cumpleCriterios from '../../api-utils/cumpleCriterio.js'
import { readFromCacheOrDisk } from '../../api-utils/readFromCaheOrDisk.js'

export default function get(options = { keys: false }) {

  // get collection
  this.getCollection = () => {
    let collectionName = this.collectionName
    let orderByProperty = this.orderByProperty
    let orderByDirection = this.orderByDirection
    let limitBy = this.limitBy
    let page = this.currentPage
    let porPag = this.porPag
    let logMessage
    let collection = [];
   
    return readFromCacheOrDisk({db:this.dbName, collectionName, lf:this.lf},(value, key) => {
  
      const data = value.data || value;
      
      let collectionItem = {}
      if (!options.keys) {
        collectionItem = this.noChange ? value : data
      }
      else {
        collectionItem = {
          key: key,
          data: this.noChange ? value : data
        }
      }
      logMessage = `Got "${ collectionName }" collection`
      if(typeof data === 'object'){
        cumpleCriterios.call(this,data) && collection.push(collectionItem);
      }
    }).then(() => {
      // orderBy
      if (orderByProperty) {
        logMessage += `, ordered by "${ orderByProperty }"`
        if (!options.keys) {
          collection.sort((a, b) => {
            return this.noChange ? a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString()) : a[orderByProperty].toString().localeCompare(b[orderByProperty].toString())
          })
        }
        else {
          collection.sort((a, b) => {
            return this.noChange ? a.data.data[orderByProperty].toString().localeCompare(b.data.data[orderByProperty].toString()): a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString())
          })
        }
      }
      if (orderByDirection == 'desc') {
        logMessage += ` (descending)`
        collection.reverse()
      }

      // pagination
      if (porPag < Infinity) {
        let start = (page - 1) * porPag
        let end = start + porPag
        collection = collection.slice(start, end)
        logMessage += `, page ${ page }`
      }

      // limit
      if (limitBy) {
        logMessage += `, limited to ${ limitBy }`
        collection = collection.splice(0,limitBy)
      }

      logMessage += `:`
      logger.log.call(this, logMessage, collection)
      reset.call(this)
      return collection
    })
  }

  // get document
  this.getDocument = () => {
    let collectionName = this.collectionName
    let docSelectionCriteria = this.docSelectionCriteria

    let collection = []
    let document = {}

    // get document by criteria
    this.getDocumentByCriteria = () => {

      return readFromCacheOrDisk({ db:this.dbName, collectionName, lf:this.lf },(value, key) => {
        const data = this.noChange ? value : value.data || value
        if (isSubset(data, docSelectionCriteria)) {
          collection.push(data)
        }
      }).then(() => {
        if (!collection.length) {
          logger.error.call(this, `Could not find Document in "${ collectionName }" collection with criteria: ${ JSON.stringify(docSelectionCriteria)}`)
        }
        else {
          document = collection[0]
          logger.log.call(this, `Got Document with ${ JSON.stringify(docSelectionCriteria) }:`, document)
          reset.call(this)
          return document
        }
      })
    }

    // get document by key
    this.getDocumentByKey = () => {
      return this.lf[collectionName].getItem(docSelectionCriteria).then((value) => {
        document = this.noChange ? value : value.data || value
        if (document) {
          logger.log.call(this, `Got Document with key ${ JSON.stringify(docSelectionCriteria) }:`, document)
        }
        else {
          logger.error.call(this, `Could not find Document in "${ collectionName }" collection with Key: ${ JSON.stringify(docSelectionCriteria)}`)
        }
        reset.call(this)
        return document
      }).catch(err => {
        logger.error.call(this, `Could not find Document in "${ collectionName }" collection with Key: ${ JSON.stringify(docSelectionCriteria)}`)
        reset.call(this)
      });
    }

    if (typeof docSelectionCriteria == 'object') {
      return this.getDocumentByCriteria()
    }
    else {
      return this.getDocumentByKey()
    }
  }

  // check for user errors
  if (!(typeof options == 'object' && options instanceof Array == false)) {
    this.userErrors.push('Data passed to .get() must be an object. Not an array, string, number or boolean. The object must contain a "keys" property set to true or false, e.g. { keys: true }')
  }
  else {
    if (!options.hasOwnProperty('keys')) {
      this.userErrors.push('Object passed to get() method must contain a "keys" property set to boolean true or false, e.g. { keys: true }')
    }
    else {
      if (typeof options.keys !== 'boolean') {
        this.userErrors.push('Property "keys" passed into get() method must be assigned a boolean value (true or false). Not a string or integer.')
      }
    }
  }

  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this)

    if (currentSelectionLevel == 'collection') {
      return this.getCollection()
    }
    else if (currentSelectionLevel == 'doc') {
      return this.getDocument()
    }
  }
  else {
    showUserErrors.call(this)
    return null
  }

}