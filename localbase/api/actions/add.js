import success from '../../api-utils/success.js'
import error from '../../api-utils/error.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import { prepare } from 'fuzzysort'
import logger from '../../utils/logger.js';
import searchStringInObject from '../../api-utils/StringInObject.js'
import { ACTIONS } from '../../api-utils/Constant.js'

/**
 * 
 * @param {*} data 
 * @param {*} keyProvided 
 * @returns 
 */
export default function add(data, keyProvided) {
  // check for user errors
  if (!data) {
    this.userErrors.push('No data specified in add() method. You must use an object, e.g { id: 1, name: "Bill", age: 47 }')
  }
  else if (!(typeof data == 'object' && data instanceof Array == false)) {
    this.userErrors.push('Data passed to .add() must be an object. Not an array, string, number or boolean.')
  }

  // no user errors, do the add
  if (!this.userErrors.length) {
    let collectionName = this.collectionName

    return new Promise((resolve, reject) => {
      let key = null

      const datos = { }

      // if no key provided, generate random, ordered key
      if (!keyProvided) {
        key = this.uid()
      }
      else {
        key = keyProvided
      }

      try {
        if (data._prepared_ === undefined) {
          datos._prepared_ = prepare(searchStringInObject(data));
        }else {
          datos._prepared_ = data._prepared_;
          delete data._prepared_
        }

      } catch (error) {
        console.trace(error)
        logger.error.call(this, error.message);
      }

      const ts = Date.now()

      datos.createdAt = data.createdAt || ts;
      datos.updatedAt = data.updatedAt || ts;
      datos._id = data._id || key;
      datos._nodeId = data._nodeId || this.nodeId;

      delete data._nodeId;
      delete data._id;
      delete data.createdAt;
      delete data.updatedAt;

      if(this.nodeId){

        if(data.clock){
          datos.clock = data.clock
          delete data.clock
        }

        if(!datos.clock) datos.clock = {[this.nodeId]:0}

        if(!datos.clock[this.nodeId]){
          datos.clock[this.nodeId] = 0
        }

      }

      if(data.data){
        datos.data = data.data;
        delete data.data;
      }else {
        datos.data = data;
      }

      return this.lf[collectionName].setItem(key, datos ).then(async () => {

        this.change(collectionName, ACTIONS.ADD, datos, key);

        resolve(
          success.call(
            this,
            `Document added to "${collectionName}" collection.`,
            { key, data }
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `Could not add Document to ${collectionName} collection.`
          )
        )
      })
    })
  }
  else {
    showUserErrors.call(this)
  }
}