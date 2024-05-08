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

    this.Localbase.iDB.getItem('peerId').then(peerId => {
      if (peerId) {
        this.peer = new Peer(peerId, this.config);
      } else {
        this.peer = new Peer(this.config);
      }

      this.peer.on('open', (id) => {
        console.log('peerId', id);
        this.Localbase.events.on('change', changes);
        if (!peerId) {
          this.Localbase.iDB.setItem('peerId', id);
        }
        this.#resolverPromesa();
      });
      this.peer.on('connection', (conn) => {
        console.log('connection', conn.peer);
        this.connecciones.push(conn);
        conn.on('data', async (data) => {
          //console.log('data', data);
          if (data.event === 'change') {
            await this.Localbase.update(data.data);
          }
        });
      });

      this.peer.on('error', (error) => {
        console.error(error);
        this.Localbase.events.off('change', changes);
      });

    });

    Cloud.intance = this;
  }

  async init() {
    await this.promesaConexion;
  }

  async addNode(nodeId) {
    if (!nodeId) throw new Error('nodeId no definido');
    let peers = await Cloud.intance.Localbase.iDB.getItem('peers');
    if (!peers) peers = JSON.stringify([]);
    peers = JSON.parse(peers);
    peers = peers.filter(peer => peer !== nodeId);
    peers.push(nodeId);
    if(Cloud.intance.peer.id === nodeId) return;
    const cone = Cloud.intance.peer.connect(nodeId);
    cone.on('open', () => {
      console.log('cone', cone.peer, cone.open);
      Cloud.intance.connecciones.push(cone);
    });
    await Cloud.intance.Localbase.iDB.setItem('peers', JSON.stringify(peers));
  }

  myId(){
    return Cloud.intance.peer.id;
  }

  async removeNode(nodeId) {
    if (!nodeId) throw new Error('nodeId no definido');
    let peers = await Cloud.intance.Localbase.iDB.getItem('peers');
    if (!peers) peers = JSON.stringify([]);
    peers = JSON.parse(peers);
    peers = peers.filter(peer => peer !== nodeId);
    await Cloud.intance.Localbase.iDB.setItem('peers', JSON.stringify(peers));
  }
}