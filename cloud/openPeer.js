import Cloud from "./cloud";
import log from "./logger";

export default async function openPeer (){
  const cone = this;
  log.log('coneccion abierta =>', cone.peer);
  Cloud.intance.connecciones = Cloud.intance.connecciones.filter(conn => conn.peer !== cone.peer);
  Cloud.intance.connecciones.push(cone);
  const last_coneccion = await Cloud.intance.Localbase.iDB.getItem(`last_coneccion_${cone.peer}`);
  if (last_coneccion) {
    cone.send({ event: 'recovery_pull', data: last_coneccion });

    Cloud.intance.Localbase.transacciones.iterate((value, key) => {
      if (value.ts >= last_coneccion) {
        log.log('isMayor', key)
        cone.send({ event: 'recovery_data', data: value })
      }
    }).then(() => {
      cone.send({ event: 'recovery_end', data: Date.now() });
      //Cloud.intance.Localbase.iDB.setItem(`last_coneccion_${cone.peer}`, Cloud.intance.Localbase.uid());
    });
  }else{
    Cloud.intance.Localbase.transacciones.iterate((value, key) => {
        cone.send({ event: 'recovery_data', data: value })
    }).then(() => {
      cone.send({ event: 'recovery_end', data: Date.now() });
      Cloud.intance.Localbase.iDB.setItem(`last_coneccion_${cone.peer}`, Date.now());
    });
  }
}
