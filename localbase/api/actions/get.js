import isSubset from '../../utils/isSubset.js'
import logger from "../../utils/logger.js"
import reset from '../../api-utils/reset.js'
import selectionLevel from '../../api-utils/selectionLevel.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import cumpleCriterios from '../../api-utils/cumpleCriterio.js'
import { single } from 'fuzzysort'

export default function get(options = { keys: false }) {
  // get collection
  this.getCollection = () => {
    let collectionName = this.collectionName
    let orderByProperty = this.orderByProperty
    let orderByDirection = this.orderByDirection
    let limitBy = this.limitBy
    let containsProperty = this.containsProperty
    let containsValue = this.containsValue
    let containsExact = this.containsExact
    let containsSinError = this.containsSinError
    let whereArguments = this.whereArguments
    const cuantosWhere = whereArguments.length
    if(cuantosWhere > 10 ) throw new Error('No se pueden usar mas de 10 where en una consulta')

    let collection = []
    let logMessage
   
    return this.lf[collectionName].iterate((value, key) => {
      let collectionItem = {}
      if (!options.keys) {
        collectionItem = value
      }
      else {
        collectionItem = {
          key: key,
          data: value
        }
      }
      logMessage = `Got "${ collectionName }" collection`
      if(containsProperty){
        let valor = value[containsProperty]
        try {
          if(typeof valor !== undefined){
            if( typeof valor === 'boolean' && typeof containsValue === 'boolean'){
              if(valor === containsValue) {
                collection.push(collectionItem);
              }
            }else if(typeof valor === 'string' && typeof containsValue === 'string'){
  
              const val = String(valor).toLowerCase()
              const cVal = String(containsValue).toLowerCase();
  
              if (!containsExact){
                if(containsSinError && val.includes(cVal)){
                  collection.push(collectionItem)
                }else {
                  const search = single(cVal, val);
                  if(search){
                    collection.push(collectionItem)
                  }
                } 
              } else if(val === cVal) collection.push(collectionItem);
  
              if(limitBy){
                if(collection.length > (limitBy + 10 )) {
                  logMessage += `, limited to contains is ${ limitBy } `
                  return collection
                }
              }
  
            }else if(typeof valor === 'number' && typeof containsValue === 'number'){
              if(valor === containsValue) collection.push(collectionItem)
            }
            logMessage += `, contains: "${ containsValue }" in "${containsProperty}"`
          }
        } catch (error) {
          this.userErrors.push(`Constain():${error.message}`)
        }
      }else if(typeof value === 'object' && cuantosWhere){
        cumpleCriterios.call(this,value) && collection.push(collectionItem)
        if(limitBy){
          if(collection.length > (limitBy + 10 )) {
            logMessage += `, limited to contains is ${ limitBy } `
            return collection
          }
        }
      }
      else {
        collection.push(collectionItem)
      }

    }).then(() => {
      // orderBy
      if (orderByProperty) {
        logMessage += `, ordered by "${ orderByProperty }"`
        if (!options.keys) {
          collection.sort((a, b) => {
            return a[orderByProperty].toString().localeCompare(b[orderByProperty].toString())
          })
        }
        else {
          collection.sort((a, b) => {
            return a.data[orderByProperty].toString().localeCompare(b.data[orderByProperty].toString())
          })
        }
      }
      if (orderByDirection == 'desc') {
        logMessage += ` (descending)`
        collection.reverse()
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
      return this.lf[collectionName].iterate((value, key) => {
        if (isSubset(value, docSelectionCriteria)) {
          collection.push(value)
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
        document = value
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