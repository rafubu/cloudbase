class Modelo {
  async databases() {
    const databases = await indexedDB.databases()
    // Itera sobre el array de bases de datos y muestra la información
    const dts = [];
    for (let i = 0; i < databases.length; i++) {
      const db = databases[i];
      // Nombre de la base de datos que quieres listar
      const dbName = db.name;
      if (dbName !== 'localbase') {
        dts.push(dbName);
      }
    }
    return dts;
  }
  
  obtenerDatos() {
    // Simulación de obtención de datos de la base de datos
    return [
      { id: 1, nombre: 'Elemento 1', descripcion: 'Descripción del elemento 1' },
      { id: 2, nombre: 'Elemento 2', descripcion: 'Descripción del elemento 2' }
    ];
  }

  obtenerElemento(id) {
    // Simulación de obtención de un elemento específico de la base de datos
    return { id: id, nombre: 'Elemento ' + id, descripcion: 'Descripción del elemento ' + id };
  }
}

export default Modelo;
