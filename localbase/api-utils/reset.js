export default function reset() {
  this.collectionName = null
  this.orderByProperty = null
  this.orderByDirection = null
  this.limitBy = null
  this.docSelectionCriteria = null
  this.userErrors = []
  this.whereArguments = []
  this.currentPage = 0
  this.porPag = Infinity
  this.whereCount = 0
}