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

export const getSplit = (key, defaultValue = [], splitter = ",") => {
  const value = get(key, "");
  return value ? value.split(splitter) : defaultValue;
};

export const getInt = (key, defaultValue = 0) => {
  const value = get(key, "");
  return value ? parseInt(value) : defaultValue;
};

export default {
  set,
  get,
  getSplit,
  getInt,
};
