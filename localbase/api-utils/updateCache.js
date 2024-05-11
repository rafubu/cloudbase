import CloudLocalbase from '../localbase.js';
import { ACTIONS } from './Constant.js';
import inChache from './inChache.js';

export default function updateCache( db, collection, key, data, action ) {
      if(inChache(db, collection)) return;
      const index = CloudLocalbase.cache[db][collection].findIndex(o => o._id === key);
      if (index !== -1) {
        if (action === ACTIONS.DELETE) {
          CloudLocalbase.cache[db][collection].splice(index, 1);
        } else {
          CloudLocalbase.cache[db][collection][index] = data;
        }
      } else {
        if (action !== ACTIONS.DELETE) {
          CloudLocalbase.cache[db][collection].push(data);
        }
      }
}