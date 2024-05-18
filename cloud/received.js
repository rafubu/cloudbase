import Cloud from "./cloud";

let inRecovery = false;
export default async function received(data) {
  const cone = this
  if (data.event === 'change') {
    await Cloud.intance.Localbase.update(data.data);
    if(!inRecovery){
      cone.send({ event:'recovery_end', data: Date.now() })
    }
  }

  if (data.event === 'recovery_pull') {
    // ultimas transacciones
    inRecovery = true;
    const transacciones = [];
    Cloud.intance.Localbase.transacciones.iterate((value, key) => {
      if (value.ts >= data.data) {
        transacciones.push(value);
      }
    }).then(() => {
      const cuantos = transacciones.length;
      if (cuantos === 0) {
        cone.send({ event: 'recovery_end', data: Date.now() });
        inRecovery = false;
      } else {
        let i = 0;
        const intervalo = setInterval(() => {
          cone.send({ event: 'recovery_data', data: transacciones[i] });
          i++;
          if (i >= cuantos) {
            clearInterval(intervalo); // Detener el intervalo cuando se hayan enviado todos los eventos
            cone.send({ event: 'recovery_end', data: Date.now() });
            inRecovery = false;
          }
        }, 50);
      }
    });
  }

  if (data.event === 'recovery_data') {
    await Cloud.intance.Localbase.update(data.data);
  }

  if (data.event === 'read') {
    const results = await Cloud.intance.Localbase.read(data.data);
    cone.send({ event: 'read_result', data: results });
  }

  if (data.event === 'recovery_end') {
    await Cloud.intance.Localbase.iDB.setItem(`last_coneccion_${cone.peer}`, data.data);
  }

}