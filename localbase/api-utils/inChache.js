import CloudLocalbase from "../localbase";

export default function inChache(db, collection) {
  if (!CloudLocalbase.cache[db]) return false;
  return CloudLocalbase.cache[db][collection] ? true : false;
}

export function kche(db, collection) {
  return CloudLocalbase.cache[db][collection];
}