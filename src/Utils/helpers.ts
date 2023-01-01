export { default as clone } from 'lodash.clonedeep';

export function last<T extends Array<any> | string>(array: T) {
  return array[array.length - 1];
}
