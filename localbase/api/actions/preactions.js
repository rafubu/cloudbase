'use strict';

/**
   * Returns a function that increments a given number by a specified amount.
   * @param {number} cuanto - The amount to increment the number by.
   * @returns {function} A function that takes a number and returns the incremented value.
   * @preserve
   */
export function increment(cuanto) {
  if (typeof cuanto !== 'number') return (valor) => valor;
  return (valor) => {
    if (typeof valor !== 'number') return valor;
    return valor + cuanto;
  }
}


/**
 * Returns a function that takes an array and returns a new array with the given data appended to it if it doesn't already exist in the array.
 * @param {*} data - The data to append to the array.
 * @returns {function} A function that takes an array and returns a new array with the given data appended to it if it doesn't already exist in the array.
 * @preserve
 */
export function arrayUnion(data) {
  return (array) => {
    if (!Array.isArray(array)) return array;

    const index = array.findIndex((element) => Bun.deepEquals(element, data, true));

    if (index === -1) {
      array.push(data);
    }

    return array;
  }
}

/**
 * Returns a function that removes the first occurrence of the given data object from an array.
 * @param {Object} data - The data object to remove from the array.
 * @returns {Function} A function that takes an array and returns a new array with the first occurrence of the given data object removed.
 * @preserve
 */
export function arrayRemove(data) {
  return (array) => {
    if (!Array.isArray(array)) {
      return array;
    }
    const index = array.findIndex((element) => Bun.deepEquals(element, data, true));

    if (index !== -1) {
      array.splice(index, 1);
    }

    return array;
  }
}