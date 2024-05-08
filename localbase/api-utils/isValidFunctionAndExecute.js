import { increment, arrayRemove, arrayUnion } from '../api/actions/preactions';

const incrementString = increment(1).toString();
const arrayUnionString = arrayUnion({}).toString();
const arrayRemoveString = arrayRemove({}).toString();

const incrementExecute = ( key,increment, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = 0;
  }

  const cuanto = old[key];
  return increment(cuanto);
}

const arrayExecute = ( key, arrayFuntion, docOldData) => {
  const old = JSON.parse(JSON.stringify(docOldData));
  if (old[key] === undefined) {
    old[key] = [];
  }

  const data = old[key];
  return arrayFuntion(data);
}

// Función principal para validar y ejecutar las funciones correctas
export default function validarYEjecutarFunciones(docNewData, docOldData) {
  try {
    for (const key in docNewData) {
      if (docNewData.hasOwnProperty(key) && typeof docNewData[key] === 'function') {
        const funcionEntrante = docNewData[key].toString();
        if (funcionEntrante === incrementString) {
          docNewData[key] = incrementExecute(key, docNewData[key], docOldData);
        } else if (funcionEntrante === arrayUnionString || funcionEntrante === arrayRemoveString) {
          docNewData[key] = arrayExecute(key, docNewData[key], docOldData);
        } else {
          throw new Error(`La propiedad ${key} es una función pero no es Localbase.increment, Localbase.arrayUnion o Localbase.arrayRemove`);
        }
      }
    }
    return docNewData;
  } catch (error) {
    throw new Error(`Error en la función validarYEjecutarFunciones: ${error.message}`);
  }
}
