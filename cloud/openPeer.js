import Cloud from "./cloud";

export default async function openPeer() {
  const cone = this;
  Cloud.intance.connecciones = Cloud.intance.connecciones.filter(conn => conn.peer !== cone.peer);
  Cloud.intance.connecciones.push(cone);
  const last_coneccion = await Cloud.intance.Localbase.iDB.getItem(`last_coneccion_${cone.peer}`);
  const transacciones = [];
  if (last_coneccion) {

    cone.send({ event: 'recovery_pull', data: last_coneccion });

    Cloud.intance.Localbase.transacciones.iterate((value, key) => {
      if (value.ts >= last_coneccion) {
        transacciones.push(value);
      }
    }).then(() => {
      const cuantos = transacciones.length;
      if (cuantos === 0) {
        cone.send({ event: 'recovery_end', data: Date.now() });
      }else{
        let i = 0;
        const intervalo = setInterval(() => {
          cone.send({ event: 'recovery_data', data: transacciones[i] });
          i++;
          if (i >= cuantos) {
            clearInterval(intervalo); // Detener el intervalo cuando se hayan enviado todos los eventos
            cone.send({ event: 'recovery_end', data: Date.now() });
          }
        }, 50); 
      }
    });
  } else {
    Cloud.intance.Localbase.transacciones.iterate((value, key) => {
      transacciones.push(value);
    }).then(() => {
      const cuantos = transacciones.length;
      if (cuantos === 0) {
        cone.send({ event: 'recovery_end', data: Date.now() });
      }else{
        let i = 0;
        const intervalo = setInterval(() => {
          cone.send({ event: 'recovery_data', data: transacciones[i] });
          i++;
          if (i >= cuantos) {
            clearInterval(intervalo); // Detener el intervalo cuando se hayan enviado todos los eventos
            cone.send({ event: 'recovery_end', data: Date.now() });
          }
        }, 50); 
      }
      Cloud.intance.Localbase.iDB.setItem(`last_coneccion_${cone.peer}`, Date.now());
    });
  }
}
