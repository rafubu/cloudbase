export default class ConnectRebase {
  #resolverPromesa = null;
  #rejectorPromesa = null;
  constructor(config,Localbase){
    if(ConnectRebase.intance) return ConnectRebase.intance
    if(!Localbase) throw new Error('Localbase no definido');
    if(!Localbase.uid) throw new Error('Localbase.uid no definido');
    if(!Localbase.events) throw new Error('Localbase.events no definido');
    if(!Localbase.iDB) throw new Error('Localbase.iDB no definido');
    if(!Localbase.transacciones) throw new Error('Localbase.transacciones no definido');
    this.config = config;
    if(!this.config) throw new Error('Configuracion no definida');
    if(!this.config.apiKey) throw new Error('ApiKey no definido');
    if(!this.config.projectId) throw new Error('projectId no definido');
    if(!this.config.host) throw new Error('host no definido');
    if(!this.config.port) this.config.port = 443;
    if(!this.config.id) this.config.id = Localbase.uid();

    if(new RegExp("^[a-zA-Z][a-zA-Z0-9-]*\.[a-zA-Z]+$/").test(this.config.host)) throw new Error('host no valido');

    this.socket = new WebSocket(`ws://${this.config.host}:${this.config.port}?id=${this.config.id}&apiKey=${this.config.apiKey}&projectId=${this.config.projectId}&ts=${Date.now()}`);

    this.promesaConexion = new Promise((resolve, reject) => {
      this.#resolverPromesa = resolve; // Función para resolver la promesa
      this.#rejectorPromesa = reject; // Función para rechazar la promesa
    });

    const changes = (data) => {
      console.log('data',data);
      this.socket.send(JSON.stringify(data));
    }

    const onOpen = () => {
      console.log('conectado');
      this.socket.isOpened = true;

      // escuchando cambios en la base de datos
      Localbase.events.on('change', changes);

      this.#resolverPromesa();
    }
    this.socket.addEventListener('open', onOpen);

    this.socket.onclose = () => {
      this.socket.removeEventListener('open', onOpen);

      // dejando de escuchar cambios en la base de datos
      Localbase.events.off('change', changes);

      console.log('conexión cerrada');
    }

    this.socket.onmessage = (event) => {
      if(typeof event.data !== 'string') return console.error('Tipo de dato no valido');

      const data = JSON.parse(event.data);
      if(data.TAG === 'MANTENIMIENTO'){
        Localbase.transacciones.clear();
        Localbase.iDB.setItem('lastUpdate',Date.now());
      }
    }
    this.socket.onerror = (error) => {
      this.socket.removeEventListener('open', onOpen)
      this.#rejectorPromesa(error);
    }

    
    ConnectRebase.intance = this
  }

  async connect(){
    return this.promesaConexion
  }
}