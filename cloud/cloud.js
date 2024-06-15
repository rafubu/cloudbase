import { Peer } from 'peerjs';
import received from './received';
import openPeer from './openPeer';
import { agruparPorKey } from './utils/array';
import { compareObjects } from '../localbase/api-utils/compareObject';

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
    if (!this.config.debug) this.config.debug = 0;

    this.promesaConexion = new Promise((resolve, reject) => {
      this.#resolverPromesa = resolve; // Función para resolver la promesa
    });

    const changes = (data) => {
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
        this.connecciones = this.connecciones.filter(conn => conn.peer !== conn.peer);
        this.connecciones.push(conn);

        conn.on('data', received);

        conn.on('close', () => {
          this.connecciones = this.connecciones.filter(conn => conn.peer !== conn.peer);
        });
      });

      this.peer.on('error', (error) => {

        console.warn('[CLOUD ] name: ' + error.name + ', message: ' + error.message + ', type: ' + error.type);

        if (error.type === 'network') {
          this.Localbase.iDB.setItem('last_coneccion', this.Localbase.uid());
          this.#resolverPromesa();
        }

        if (error.type === 'unavailable-id') {
          this.Localbase.iDB.setItem('last_coneccion', this.Localbase.uid());
          this.#resolverPromesa();
        }

        if (error.type === 'peer-unavailable') {
          this.connecciones = this.connecciones.filter(conn => conn.open);
          this.Localbase.iDB.setItem('peers', JSON.stringify(this.connecciones.map(conn => ({ nodeId: conn.peer, label: conn.label }))));
          return
        }
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
    const data = await this.Localbase.read(query);
    const peersConectados = this.connecciones.filter(conn => conn.open);
    const results = {};
    results[this.peer.id] = data;
    const resultados = await new Promise(async (resolve, reject) => {
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

    let resolver = [];
    for (const key in resultados) {
      const result = resultados[key];
      if (result instanceof Array) {
        resolver = resolver.concat(result);
      }else {
        resolver.push(result);
      }
    }
    console.log('resolver', resolver);
    const agrupados = agruparPorKey(resolver, '_id');

    const resultadosFinales = [];
    for (const key in agrupados) {
      const grupo = agrupados[key];
      if (grupo.length > 1) {
        const resolvedObject = grupo.reduce((prev, current) => {
          return compareObjects(prev, current) > 0 ? prev : current;
        });
        resultadosFinales.push(resolvedObject);
      }else {
        resultadosFinales.push(grupo[0]);
      }
    }
    if (resultadosFinales.length === 0) {
      return null;
    }else if (resultadosFinales.length === 1) {
      return resultadosFinales[0];
    }else {
      return resultadosFinales;
    }
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
    const peers = await Cloud.intance.getPeers();

    const peersNoConectados = peers.filter(peer => !Cloud.intance.connecciones.find(conn => conn.peer === peer.nodeId));

    for (const { nodeId, label } of peersNoConectados) {
      try {
        const cone = Cloud.intance.peer.connect(nodeId, { label, reliable: true });
        cone.on('error', (error) => {
          console.warn('[CLOUD ] name: ' + error.name + ', message: ' + error.message + ', type: ' + error.type);
        });
        cone.on('close', () => {
          console.warn('[CLOUD ] coneccion cerrada');
          Cloud.intance.connecciones = Cloud.intance.connecciones.filter(conn => conn.peer !== cone.peer);
        });
        cone.on('open', openPeer);

        cone.on('data', received);
      } catch (error) {
        console.warn('[CLOUD ] error al conectar', error);
      }
    }
  }

}