import Cloud from "./cloud";
import log from "./logger";

export default async function received(data){
    const conn = this
    log.log('data received',data)
    if (data.event === 'change') {
      await Cloud.intance.Localbase.update(data.data);
      conn.send({ event: 'recovery_end', data: Date.now() })
    }
    
    if (data.event === 'recovery_pull') {
      // ultimas transacciones
      Cloud.intance.Localbase.transacciones.iterate((value, key) => {
        if (value.ts >= data.data) {
          conn.send({ event: 'recovery_data', data: value })
        }
      }).then(() => {
        conn.send({ event: 'recovery_end', data: Date.now() })
      });
    }

    if (data.event === 'recovery_data') {
      await Cloud.intance.Localbase.update(data.data);
    }

    if (data.event === 'read') {
      const results = await Cloud.intance.Localbase.read(data.data);
      conn.send({ event: 'read_result', data: results });
    }

    if (data.event === 'recovery_end') {
      await Cloud.intance.Localbase.iDB.setItem(`last_coneccion_${conn.peer}`, data.data);
    }
  
}