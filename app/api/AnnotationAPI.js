export default class AnnotationAPI {
  /* ------------ ANNOTATION SEARCH --------------------------------------*/

  static getFilteredAnnotations = (
    userId,
    filters,
    not_filters,
    callback,
    offset = 0,
    size = 250,
    sort = null,
    dateRange = null,
  ) => {
    const url = _config.ANNOTATION_API_BASE + "/annotations/filter";
    const params = {
      filters: filters,
      not_filters: not_filters,
      offset: offset,
      size: size,
      sort: sort,
      dateRange: dateRange,
      user: userId,
    };
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          callback(
            Object.prototype.hasOwnProperty.call(resp, "error") ? null : resp,
          );
        } else {
          callback(null);
        }
      }
    };
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(params)); //all params with empty values are removed from the params with stringify...
  };

  /* ------------ USER/PROJECT AWARE RETRIEVAL (FOR BOOKMARKS & "ANNOTATIONS"/BODIES) ---------------*/

  //TODO create way of calling bookmark function with o=resource_list
  static getBookmarks = (userId, projectId, callback) => {
    const url =
      _config.ANNOTATION_API_BASE +
      "/user/" +
      userId +
      "/project/" +
      projectId +
      "/bookmarks";
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          //TODO the server should return the proper status code on error!!
          if (Object.prototype.hasOwnProperty.call(resp, "error")) {
            callback([]); //return an empty list by default
          } else {
            callback(resp);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  };

  static getAnnotationCounts = (userId, projectId, callback) => {
    const url =
      _config.ANNOTATION_API_BASE +
      "/user/" +
      userId +
      "/project/" +
      projectId +
      "/bookmarks?o=count";
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          callback(JSON.parse(xhr.responseText));
        } else {
          callback(null);
        }
      }
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  };

  static getAnnotationBodies = (
    userId,
    projectId,
    annotationType,
    callback,
  ) => {
    const url =
      _config.ANNOTATION_API_BASE +
      "/user/" +
      userId +
      "/project/" +
      projectId +
      "/" +
      annotationType;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          //TODO the server should return the proper status code on error!!
          if (Object.prototype.hasOwnProperty.call(resp, "error")) {
            callback([]); //return an empty list by default
          } else {
            callback(JSON.parse(xhr.responseText));
          }
        } else {
          callback([]); //return an empty list by default
        }
      }
    };
    xhr.open("GET", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  };

  /* ------------ DELETE USER ANNOTATIONS (PROJECT AGNOSTIC)--------------------*/

  static deleteUserAnnotations = (
    projectId,
    userId,
    deletionList,
    callback
  ) => {
    console.debug("DELETING USER ANNOTATIONS", deletionList);
    const url =
      _config.ANNOTATION_API_BASE +
      "/user/" +
      userId +
      "/project/" +
      projectId +
      "/annotations";
    const params = {
      toDelete: deletionList,
    };
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          callback(JSON.parse(xhr.responseText));
        } else {
          callback([]); //return an empty list by default
        }
      }
    };
    xhr.open("DELETE", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    if (params) {
      xhr.send(JSON.stringify(params));
    } else {
      xhr.send();
    }
  };
}
