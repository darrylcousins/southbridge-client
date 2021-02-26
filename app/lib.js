/**
 * Some library methods
 *
 * @module app/lib
 * @author Darryl Cousins <darryljcousins@gmail.com>
 */

/**
 * Shallow compare two objects - adequate from 'flat' objects of key/value pairs
 *
 * @returns {boolean} Returns true if shallow comparison passes
 * @param {object} object1 Object to compare
 * @param {object} object2 Other object to compare
 * @example
 * const o1 = {me: 'dc', you: 'mh'};
 * const o2 = {me: 'dc', you: 'mh'};
 * shallowEqual(o1, o2) // true
 */
function shallowEqual(object1, object2) {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (object1[key] !== object2[key]) {
      return false;
    }
  }

  return true;
}

export {
  shallowEqual
};
