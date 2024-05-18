import cumpleCriterios from "../../api-utils/cumpleCriterio";
import { readFromCacheOrDisk } from "../../api-utils/readFromCaheOrDisk";
import reset from "../../api-utils/reset";
import showUserErrors from "../../api-utils/showUserErrors";

export default async function count() {
  if (this.collectionName === null) {
    this.userErrors.push('No se ha seleccionado una colección');
  }

  if (this.userErrors.length > 0) {
    showUserErrors.call(this);
    reset.call(this);
  }

  let count = 0;
  try {
    let collectionName = this.collectionName;
    let dbName = this.dbName;
    let lf = this.lf;
    await readFromCacheOrDisk({ db: dbName, collectionName: collectionName, lf }, (value, key) => {
      const data = value.data || value;
      cumpleCriterios.call(this, data) && count++;
    })
    return count;
  } catch (error) {
    return count;
  }
}