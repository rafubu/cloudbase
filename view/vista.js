class Vista {

  mostrarLista(datos) {
    var listaHTML = '<h1>Lista de elementos</h1>';
    listaHTML += '<ul>';
    datos.forEach(function(elemento) {
      listaHTML += `<li><a href="/db/' + elemento.id + '">' + elemento.nombre + '</a></li>`;
    });
    listaHTML += '</ul>';

    document.getElementById('app').innerHTML = listaHTML;
  }

  mostrarDetalle(elemento) {
    var detalleHTML = '<h1>Detalle del elemento</h1>';
    detalleHTML += '<p>Nombre: ' + elemento.nombre + '</p>';
    detalleHTML += '<p>Descripción: ' + elemento.descripcion + '</p>';

    document.getElementById('app').innerHTML = detalleHTML;
  }
}

export default Vista;
