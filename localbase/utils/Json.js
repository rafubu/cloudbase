export function minificarJSON(data, claveMinificada = {}, acum=false) {

  if(data instanceof Array){
    return { jsonMinificado: data.map(d => minificarJSON(d, claveMinificada, true)), claveMinificada };
  }
  // Convertir el JSON a cadena
  let jsonString = JSON.stringify(data);

  // Reemplazar cada clave en el JSON con una clave minificada
  jsonString = jsonString.replace(/"([^"]+)":/g, function(match, clave) {
    if(!claveMinificada[clave]){
      let indice = Object.keys(claveMinificada).length;
      const nuevaClave = generarClaveSecuencial(indice++);
      claveMinificada[clave] = nuevaClave;
      return '"' + nuevaClave + '":';
    }else{
      return '"' + claveMinificada[clave] + '":';
    }
  });

  // Convertir la cadena JSON minificada de vuelta a un objeto JSON
  const jsonMinificado = JSON.parse(jsonString);

  return acum ? jsonMinificado: { jsonMinificado, claveMinificada };
}

// Función recursiva para restaurar claves en un objeto JSON
function restaurarClaves(objeto, claveMinificada) {
  if (typeof objeto === 'object') {
      for (const clave in objeto) {
          if (objeto.hasOwnProperty(clave)) {
              const valor = objeto[clave];
              if (typeof valor === 'object') {
                  // Si el valor es un objeto, llama recursivamente a la función
                  objeto[clave] = restaurarClaves(valor, claveMinificada);
              }
              if (claveMinificada.hasOwnProperty(clave)) {
                  // Si la clave minificada existe en el mapeo, reemplaza la clave minificada con la clave original
                  const claveOriginal = claveMinificada[clave];
                  objeto[claveOriginal] = valor;
                  delete objeto[clave];
              }
          }
      }
  }
  return objeto;
}

// Función para restaurar un JSON minificado al estado original
export function restaurarJSON(jsonMinificado, claveMinificada) {
  // Restaurar claves en el objeto JSON
  return restaurarClaves(jsonMinificado, claveMinificada);
}

// Función para generar una clave alfabética secuencial
export function generarClaveSecuencial(indice) {
  var letras = "abcdefghijklmnopqrstuvwxyz"; // Caracteres disponibles
  var base = letras.length; // Longitud del alfabeto
  var clave = "";

  while (indice >= 0) {
      clave = letras[indice % base] + clave;
      indice = Math.floor(indice / base) - 1;
  }

  return clave;
}

export function calcularTamañoEnByte(objeto) {
  const json = JSON.stringify(objeto);
  const bytes = new Blob([json]).size;
  return bytes;
}

export function calcularTamañoEnKB(objeto) {
  return calcularTamañoEnByte(objeto) / 1024;
}

export function calcularTamañoEnMB(objeto) {
  return calcularTamañoEnKB(objeto) / 1024;
}
