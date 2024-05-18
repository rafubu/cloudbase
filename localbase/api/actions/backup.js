import { minificarJSON } from "../../utils/Json";

async function respaldarBaseDeDatos() {
  // Abre la base de datos maestra para listar todas las bases de datos
  return await new Promise(async (resolve, reject) => {
    try {
      const databases = await indexedDB.databases()
        // Itera sobre el array de bases de datos y muestra la información
        const dbs = {}

        for (let i = 0; i < databases.length; i++) {
          const db = databases[i];
          // Nombre de la base de datos que quieres listar
          const dbName = db.name;
          dbs[dbName] = await respaldarBaseDeDato(dbName);
        }
        resolve(dbs);
    } catch (error) {
      reject(error);
    }
  });
}

async function respaldarCollection(dbName, collectionName) {
  if (!dbName || !collectionName) throw new Error("Faltan argumentos requeridos");
  // Abrir la base de datos
  const solicitudDeApertura = window.indexedDB.open(dbName);

  return await new Promise((resolve, reject) => {

    solicitudDeApertura.onsuccess = function (evento) {
      // Obtener la base de datos
      const db = evento.target.result;

      // Iniciar una transacción de solo lectura en el almacén
      const transaccion = db.transaction(collectionName, "readonly");

      // Obtener el almacén
      const almacen = transaccion.objectStore(collectionName);


      // Abrir un cursor para recorrer los datos
      const solicitudCursor = almacen.openCursor();

      const datos = [];
      solicitudCursor.onsuccess = function (evento) {
        // Obtener el cursor
        const cursor = evento.target.result;

        // Verificar si hay más datos
        if (cursor) {
          // Acceder a los datos del cursor (cursor.value)
          datos.push({key:cursor.key,value:cursor.value});
          // Mover el cursor al siguiente elemento
          cursor.continue();
        } else {
          resolve(datos);
        }
      };

      solicitudCursor.onerror = function (evento) {
        reject(evento.target.error);
      };


    };

    solicitudDeApertura.onerror = function (evento) {
      reject(evento.target.error);
    };
  });

}

async function respaldarBaseDeDato(dbName) {
  // Abre la base de datos maestra para listar todas las bases de datos
  return await new Promise((resolve, reject) => {

    // Abre la base de datos
    const request = indexedDB.open(dbName);

    // Manejador de éxito cuando la base de datos se abre correctamente
    request.onsuccess = async function (event) {
      // Obtén la referencia a la base de datos
      const db = event.target.result;

      // Obtiene una lista de nombres de almacenes en la base de datos
      const storeNames = db.objectStoreNames;

      // Itera sobre los nombres de los almacenes y los imprime en la consola
      const datas = {};
      for (let i = 0; i < storeNames.length; i++) {
        datas[storeNames[i]] = await respaldarCollection(dbName, storeNames[i]);
      }
      resolve(datas);
    };

    // Manejador de errores
    request.onerror = function (event) {
      console.error("Error al abrir la base de datos:", event.target.error);
      reject(event.target.error);
    };

  });
}

export default async function backup(options={}) {
  if (!indexedDB) throw new Error("Tu navegador no soporta indexedDB");
  if(options && typeof options !== 'object') throw new Error("Opciones debe ser un objeto");

  const minify = options.minify || false;

  if ('db' in options) {
    if ('collection' in options) {
      const datos = await respaldarCollection(options.db, options.collection);
      if(minify){
        const claveMinificada = {};
        const { jsonMinificado } = minificarJSON(datos, claveMinificada);
        return {claveMinificada, jsonMinificado}
      }
      return datos;
    }else {
      if(minify){
        const claveMinificada = {};
        const { jsonMinificado } = minificarJSON(await respaldarBaseDeDato(options.db), claveMinificada);
        return {claveMinificada, jsonMinificado}
      }
      return await respaldarBaseDeDato(options.db);
    }
  }
  return await respaldarBaseDeDatos();
}