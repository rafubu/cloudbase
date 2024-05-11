import { Peer } from 'peerjs';

export default class Cloud {
  #resolverPromesa = null;

  constructor(config, Localbase) {
    if (Cloud.intance) return Cloud.intance
    if (!Localbase) throw new Error('Localbase no definido');
    if (!Localbase.uid) throw new Error('Localbase.uid no definido');
    if (!Localbase.events) throw new Error('Localbase.events no definido');
    if (!Localbase.iDB) throw new Error('Localbase.iDB no definido');
    if (!Localbase.transacciones) throw new Error('Localbase.transacciones no definido');
    this.Localbase = Localbase;
    this.config = config;
    this.connecciones = [];
    Localbase.isCloud = true;

    if (!this.config) throw new Error('Configuracion no definida');
    if (!this.config.key) throw new Error('ApiKey no definido');
    if (!this.config.host) throw new Error('host no definido');
    if (!this.config.debug) this.config.debug = 1;

    this.promesaConexion = new Promise((resolve, reject) => {
      this.#resolverPromesa = resolve; // Función para resolver la promesa
    });

    const changes = (data) => {
      console.log('notificando cambios')
      this.connecciones.forEach(conn => {
        if (conn.open) conn.send({ event: 'change', data });
      });
    }

    this.Localbase.iDB.getItem('peerId').then(async peerId => {
      Localbase.nodeId = peerId;

      // Si no existe la base de datos, creamos el registro
      const createdDB = await this.Localbase.iDB.getItem('createdDB');
      if (!createdDB) await this.Localbase.iDB.setItem('createdDB', Date.now());

      if (peerId) {
        this.peer = new Peer(peerId, this.config);
      } else {
        this.peer = new Peer(this.config);
      }

      this.peer.on('open', async (id) => {

        const openLatest = await this.Localbase.iDB.getItem('open_ultimo');

        if (!openLatest) {
          await this.Localbase.iDB.setItem('open_ultimo', Date.now());
        } else {
          await this.Localbase.iDB.setItem('open_antiguo', openLatest);
          await this.Localbase.iDB.setItem('open_ultimo', Date.now());
        }

        this.Localbase.events.on('change', changes);

        if (!peerId) {
          Localbase.nodeId = id;
          this.Localbase.iDB.setItem('peerId', id);
        }

        this.#resolverPromesa();
      });
      this.peer.on('connection', (conn) => {
        console.log('connection', conn.peer);
        this.connecciones = this.connecciones.filter(conn => conn.peer !== conn.peer);
        this.connecciones.push(conn);

        conn.on('data', async (data) => {
          console.log('data received', data);
          if (data.event === 'change') {
            await this.Localbase.update(data.data, this.peer.id);
          }

          if (data.event === 'recovery_pull') {
            // ultimas transacciones
            this.Localbase.transacciones.iterate((value, key) => {
              if (key >= data.data) {
                conn.send({ event: 'recovery_data', data: value })
              }
            }).then(() => {
              conn.send({ event: 'recovery_end', data: Date.now() })
            });

          }

          if (data.event === 'recovery_data') {
            await this.Localbase.update(JSON.parse(data.data), this.peer.id);
          }

          if (data.event === 'read') {
            const results = await this.Localbase.read(data.data);
            conn.send({ event: 'read_result', data: results });
          }

          if (data.event === 'recovery_end') {
            console.log('recovery_end', data)
          }
        });

        conn.on('close', () => {
          console.log('close', conn.peer);
          this.connecciones = this.connecciones.filter(conn => conn.peer !== conn.peer);
        });
      });

      this.peer.on('error', (error) => {

        console.log('[CLOUD ] name: ', error.name, ', message: ', error.message, ', type: ', error.type);

        if (error.type === 'network') {
          this.Localbase.iDB.setItem('last_coneccion', this.Localbase.uid());

        }

        if (error.type === 'unavailable-id') {
          console.warn('unavailable-id');
          this.Localbase.iDB.setItem('last_coneccion', this.Localbase.uid());
        }

        if (error.type === 'peer-unavailable') {
          console.warn('peer-unavailable');
          this.connecciones = this.connecciones.filter(conn => conn.open);
          this.Localbase.iDB.setItem('peers', JSON.stringify(this.connecciones.map(conn => ({ nodeId: conn.peer, label: conn.label }))));
          return
        }
        this.Localbase.events.off('change', changes);
      });

    });

    Cloud.intance = this;
  }

  async init() {
    await this.promesaConexion;
  }

  async addNode(label, nodeId) {
    if (!nodeId) throw new Error('nodeId no definido');
    if (Cloud.intance.peer.id === nodeId) return;
    let peers = await this.getPeers();
    peers = peers.filter(peer => peer.nodeId !== nodeId);
    peers.push({ nodeId, label });
    await Cloud.intance.Localbase.iDB.setItem('peers', JSON.stringify(peers));
  }

  async getPeers() {
    let peers = await Cloud.intance.Localbase.iDB.getItem('peers');
    if (!peers) peers = JSON.stringify([]);
    return JSON.parse(peers);
  }

  async read(query) {
    const peersConectados = this.connecciones.filter(conn => conn.open);
    const results = {};
    return new Promise(async (resolve, reject) => {
      for (const conn of peersConectados) {
        await new Promise((res, rej) => {
          setTimeout(() => rej('timeout'), 10000);
          conn.send({ event: 'read', data: query });
          conn.on('data', (data) => {
            if (data.event === 'read_result') {
              results[conn.peer] = data.data;
              res();
            }
          });
        });
      }
      resolve(results);
    });
  }


  myId() {
    return Cloud.intance.peer.id;
  }

  async removeNode(nodeId) {
    if (!nodeId) throw new Error('nodeId no definido');
    let peers = await this.getPeers();
    peers = peers.filter(peer => peer.nodeId !== nodeId);
    await Cloud.intance.Localbase.iDB.setItem('peers', JSON.stringify(peers));
  }


  static async conectar() {
    console.log('conectando')
    const peers = await Cloud.intance.getPeers();

    const peersNoConectados = peers.filter(peer => !Cloud.intance.connecciones.find(conn => conn.peer === peer.nodeId));

    const last_coneccion = await Cloud.intance.Localbase.iDB.getItem('last_coneccion');

    for (const { nodeId, label } of peersNoConectados) {
      const cone = Cloud.intance.peer.connect(nodeId, { label, reliable: true });
      cone.on('error', (error) => {
        console.error('error cone', error);
      });
      cone.on('close', () => {
        console.log('cone', cone.peer, cone.open);
        Cloud.intance.connecciones = Cloud.intance.connecciones.filter(conn => conn.peer !== cone.peer);
      });
      cone.on('open', () => {
        console.log('coneccion abierta =>', cone.peer);
        Cloud.intance.connecciones = Cloud.intance.connecciones.filter(conn => conn.peer !== cone.peer);
        Cloud.intance.connecciones.push(cone);
        if (last_coneccion) {
          cone.send({ event: 'recovery_pull', data: last_coneccion });

          Cloud.intance.Localbase.transacciones.iterate((value, key) => {
            if (key >= last_coneccion) {
              console.log('isMayor', key)
              cone.send({ event: 'recovery_data', data: value })
            }
          }).then(() => {
            cone.send({ event: 'recovery_end', data: Date.now() })
          });
        }
      });
    }

    // await Cloud.intance.Localbase.iDB.removeItem('last_coneccion');
  }
}