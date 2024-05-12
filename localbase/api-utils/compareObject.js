export function compareObjects(a, b) {
  // Comparamos por timestamp
  if (a.updatedAt < b.updatedAt) {
    return -1;
  } else if (a.updatedAt > b.updatedAt) {
    return 1;
  } else {
    // En caso de empate, utilizamos Vector Clocks
    const aClock = a.clock || {};
    const bClock = b.clock || {};
    let aWins = false;
    let bWins = false;

    // Comparamos los relojes vectoriales
    for (const nodeId in aClock) {
      if (aClock[nodeId] > (bClock[nodeId] || 0)) {
        aWins = true;
      } else if (aClock[nodeId] < (bClock[nodeId] || 0)) {
        bWins = true;
      }
    }

    if (aWins && !bWins) {
      return -1;
    } else if (!aWins && bWins) {
      return 1;
    } else {
      if(a._nodeId && b._nodeId) {
        // En caso de empate en los relojes vectoriales, resolvemos por ID del nodo
        return a._nodeId.localeCompare(b._nodeId);
      }else{
        return 0;
      }
    }
  }
}
