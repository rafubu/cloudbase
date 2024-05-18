export function agruparPorKey(array, key) {
  // Creamos un objeto vacío para almacenar los resultados
  const resultado = {};

  // Iteramos sobre cada objeto en el array
  array.forEach(objeto => {
    // Obtenemos el valor de la clave para el objeto actual
    const valor = objeto[key];

    // Verificamos si ya existe una entrada en el resultado para ese valor
    if (!resultado[valor]) {
      // Si no existe, creamos una nueva entrada con un array vacío
      resultado[valor] = [];
    }

    // Agregamos el objeto actual al array correspondiente en el resultado
    resultado[valor].push(objeto);
  });

  // Retornamos el objeto resultado
  return resultado;
}