/**
 * Session Storage handler to make use of sessionstorage more simple/consistent
 */
export const set = (key, value) => {
  if (window.sessionStorage) {
    window.sessionStorage.setItem(key, value);
    return true;
  }
  return false;
};

export const get = (key, defaultValue = "") => {
  if (window.sessionStorage) {
    const v = window.sessionStorage.getItem(key);
    if (v) {
      return v;
    }
  }
  return defaultValue;
};

export default {
  set,
  get
};
