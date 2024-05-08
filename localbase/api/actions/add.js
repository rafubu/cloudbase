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

      // if no key provided, generate random, ordered key
      if (!keyProvided) {
        key = this.uid()
      }
      else {
        key = keyProvided
      }

      try {
        if (data._prepared_ === undefined) {
          data._prepared_ = prepare(searchStringInObject(data));
        }

      } catch (error) {
        console.trace(error)
        logger.error.call(this, error.message);
      }

      return this.lf[collectionName].setItem(key, data).then(async () => {

        this.change(collectionName, ACTIONS.ADD, data, key);

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