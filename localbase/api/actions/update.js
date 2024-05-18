import logger from '../../utils/logger.js'
import isSubset from '../../utils/isSubset.js'
import updateObject from '../../utils/updateObject.js'
import success from '../../api-utils/success.js'
import error from '../../api-utils/error.js'
import showUserErrors from '../../api-utils/showUserErrors.js'
import isValidFuntionAnExecute from '../../api-utils/isValidFunctionAndExecute.js'
import cumpleCriterios from '../../api-utils/cumpleCriterio.js'
import { ACTIONS } from '../../api-utils/Constant.js'
import { compareObjects } from '../../api-utils/compareObject.js'
import { prepare } from 'fuzzysort'
import searchStringInObject from '../../api-utils/StringInObject.js'

export default function update(docUpdates) {
  let collectionName = this.collectionName
  let docSelectionCriteria = this.docSelectionCriteria
  let nodeId = this.nodeId
  let whereCount = this.whereCount;

  return new Promise((resolve, reject) => {

    this.actualizarDataDefault = (documento) => {
      documento.updatedAt = Date.now();


      if (documento._prepared_) {
        documento._prepared_ = prepare(searchStringInObject(documento.data));
      }

      if (nodeId) {
        documento.nodeId = nodeId;
        if (documento.clock) {
          if (documento.clock[nodeId]) {
            documento.clock[nodeId]++;
          } else {
            documento.clock[nodeId] = 1;
          }
        }
      }
      return documento;
    }

    // update document by criteria
    this.updateDocumentByCriteria = () => {
      let docsToUpdate = []
      this.lf[collectionName].iterate((value, key) => {
        const oldDocument = JSON.parse(JSON.stringify(value));
        const oldData = JSON.parse(JSON.stringify(value.data || {}));
        const dataAUpdated = isValidFuntionAnExecute.call(this, docUpdates, oldData);
        if (whereCount === 0) {
          if (isSubset(dataAUpdated, docSelectionCriteria)) {
            const newData = updateObject(oldData, dataAUpdated);
            const newDocument = this.actualizarDataDefault({ ...oldDocument, data: newData });
            docsToUpdate.push({ key, newDocument, oldDocument })
          }
        } else if (cumpleCriterios.call(this, oldData)) {
          const newData = updateObject(oldData, dataAUpdated);
          const newDocument = this.actualizarDataDefault({ ...oldDocument, data: newData });
          docsToUpdate.push({ key, newDocument, oldDocument })
        }
      }).then(() => {
        if (!docsToUpdate.length) {
          reject(
            error.call(
              this,
              `No Documents found in ${collectionName} Collection with criteria ${JSON.stringify(docSelectionCriteria)}.`
            )
          )
        }
        if (docsToUpdate.length > 1) {
          logger.warn.call(this, `Multiple documents (${docsToUpdate.length}) with ${JSON.stringify(docSelectionCriteria)} found for updating.`)
        }
      }).then(() => {
        docsToUpdate.forEach((docToUpdate, index) => {
          this.lf[collectionName].setItem(docToUpdate.key, docToUpdate.newDocument).then(value => {

            this.change(collectionName, ACTIONS.UPDATE, { ...docToUpdate }, docToUpdate.key)
            if (index === (docsToUpdate.length - 1)) {
              resolve(
                success.call(
                  this,
                  `${docsToUpdate.length} Document${docsToUpdate.length > 1 ? 's' : ''} in "${collectionName}" collection with ${JSON.stringify(docSelectionCriteria)} updated.`,
                  docUpdates
                )
              )
            }

          }).catch(err => {
            reject(
              error.call(
                this,
                `Could not update ${docsToUpdate.length} Documents in ${collectionName} Collection.`
              )
            )
          })
        })
      })
    }

    // update document by key
    this.updateDocumentByKey = () => {
      let docToUpdate = { key: docSelectionCriteria, }
      this.lf[collectionName].getItem(docSelectionCriteria).then(value => {
        docToUpdate.oldDocument = JSON.parse(JSON.stringify(value));

        const oldData = JSON.parse(JSON.stringify(value.data || {}));
        const newData = isValidFuntionAnExecute.call(this, docUpdates, oldData);

        docToUpdate.newDocument = this.actualizarDataDefault({ ...value, data: updateObject(oldData, newData) });

        this.lf[collectionName].setItem(docSelectionCriteria, docToUpdate.newDocument)

        this.change(collectionName, ACTIONS.UPDATE, docToUpdate, docToUpdate.key)

        resolve(
          success.call(
            this,
            `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`,
            docToUpdate.newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`
          )
        )
      })
    }

    // update document by key
    this.updateDocumentByKeyCloud = () => {
      let docToUpdate = { key: docSelectionCriteria, }
      this.lf[collectionName].getItem(docSelectionCriteria).then(value => {

        if (docUpdates.clock) {
          if (docUpdates.clock[nodeId]) {
            docUpdates.clock[nodeId]++;
          } else {
            docUpdates.clock[nodeId] = 1;
          }
        }

        const dbResult = [value, docUpdates];

        // Resolver conflictos y obtener el objeto más reciente
        const resolvedObject = dbResult.reduce((prev, current) => {
          return compareObjects(prev, current) > 0 ? prev : current;
        });

        resolvedObject.nodeId = nodeId;

        docToUpdate.oldDocument = JSON.parse(JSON.stringify(value));
        docToUpdate.newDocument = JSON.parse(JSON.stringify(resolvedObject));

        this.lf[collectionName].setItem(docSelectionCriteria, docToUpdate.newDocument)

        this.change(collectionName, ACTIONS.UPDATE, docToUpdate, docToUpdate.key)

        resolve(
          success.call(
            this,
            `Document in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)} updated.`,
            docToUpdate.newDocument
          )
        )
      }).catch(err => {
        reject(
          error.call(
            this,
            `No Document found in "${collectionName}" collection with key ${JSON.stringify(docSelectionCriteria)}`
          )
        )
      })
    }

    // check for user errors
    if (!docUpdates) {
      this.userErrors.push('No update object provided to update() method. Use an object e.g. { name: "William" }')
    }
    else if (!(typeof docUpdates == 'object' && docUpdates instanceof Array == false)) {
      this.userErrors.push('Data passed to .update() must be an object. Not an array, string, number or boolean.')
    }

    
    if (!this.userErrors.length) {
      if (typeof docSelectionCriteria == 'object') {
        if (docSelectionCriteria !== null || this.whereCount > 0) {
          this.updateDocumentByCriteria()
        }
      }
      else {
        if (this.noChange) {
          this.updateDocumentByKeyCloud()
        } else {
          this.updateDocumentByKey()
        }
      }
    }
    else {
      showUserErrors.call(this)
    }

  })

}