import selectionLevel from '../../api-utils/selectionLevel.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import Localbase from '../../localbase.js'

export default function off(callback) {

  this.onCollection = ()=>{
    let collectionName = this.collectionName;
    let dbName = this.dbName;
    Localbase.events.off(`db:${dbName}:col:${collectionName}`, callback)
  }

  this.onDocument = ()=>{
    let docSelectionCriteria = this.docSelectionCriteria;
    if(typeof docSelectionCriteria !== 'string') throw new Error('no se especifico el documento a observar');
    Localbase.events.off(`doc:${docSelectionCriteria}`, callback);
  }

  // check for user errors
  if (!(typeof callback == 'function')) {
    this.userErrors.push('Callback passed to off() method must be a function')
  }

  if (!this.userErrors.length) {
    let currentSelectionLevel = selectionLevel.call(this)

    if (currentSelectionLevel == 'collection') {
      return this.onCollection()
    }
    else if (currentSelectionLevel == 'doc') {
      return this.onDocument()
    }
  }
  else {
    showUserErrors.call(this)
    return null
  }

}