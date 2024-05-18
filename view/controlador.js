import Modelo from './modelo.js';
import Vista from './vista.js';

class Controlador {
  constructor() {
    this.modelo = new Modelo();
    this.vista = new Vista();
    this.rutaInicial = window.location.pathname;
  }

  iniciar() {
    this.mostrarLista();
    window.addEventListener('popstate', this.enRutaCambiada.bind(this));
  }

  mostrarLista() {
    var datos = this.modelo.obtenerDatos();
    this.vista.mostrarLista(datos);
  }

  mostrarDetalle(id) {
    var elemento = this.modelo.obtenerElemento(id);
    this.vista.mostrarDetalle(elemento);
  }

  enRutaCambiada(e) {
    console.log('Ruta cambiada:', e);
    var ruta = window.location.pathname;
    console.log('Ruta cambiada:', ruta);
    if (ruta === this.rutaInicial+'db') {
      this.mostrarLista();
    } else if (ruta.startsWith('/db/')) {
      var id = parseInt(ruta.substring(4)); // Obtener el ID del elemento de la ruta
      this.mostrarDetalle(id);
    } else {
      console.log('Ruta desconocida:', ruta);
    }
  }
}

export default Controlador;
