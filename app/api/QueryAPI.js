import UserQuery from "../model/UserQuery";
import APIError from "../model/APIError";

export default class QueryAPI {
  static save = (userId, projectId, query, callback) => {
    let url = _config.QUERY_API_BASE + "/";
    if (userId) {
      url += userId + "/";
      if (projectId) {
        url += "projects/" + projectId + "/";
      }
    }
    url += "queries";

    let method = "POST";
    if (query.id) {
      // existing query, update it
      url += "/" + query.id;
      method = "PUT";
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error) {
            callback(UserQuery.construct(respData));
          } else {
            callback(null);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.open(method, url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send(JSON.stringify(query.toServerObject()));
  };

  static list = (userId, projectId, callback) => {
    let url = _config.QUERY_API_BASE + "/";
    if (userId) {
      url += userId + "/";
      if (projectId) {
        url += "projects/" + projectId + "/";
      }
    }
    url += "queries";
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error && typeof respData === "object") {
            callback(respData.map((q) => UserQuery.construct(q)));
          } else {
            callback(null);
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

  static get = (queryId, userId, projectId, callback) => {
    let url = _config.QUERY_API_BASE + "/";
    if (userId) {
      url += userId + "/";
      if (projectId) {
        url += "projects/" + projectId + "/";
      }
    }
    url += "queries/";
    url += encodeURIComponent(queryId);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (!respData) {
            callback(null);
          } else if (respData.error) {
            callback(new APIError(respData.error));
          } else {
            callback(UserQuery.construct(respData));
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

  static delete = (queryId, userId, projectId, callback) => {
    let url = _config.QUERY_API_BASE + "/";
    url += userId + "/";
    url += "projects/" + projectId + "/";
    url += "queries/";
    url += encodeURIComponent(queryId);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (!respData) {
            callback(null);
          } else if (respData.error) {
            callback(new APIError(respData.error));
          } else {
            callback(respData);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.open("DELETE", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  };

  static query_operation = (
    queryId,
    userId,
    projectId,
    operation,
    callback
  ) => {
    let url = _config.QUERY_API_BASE + "/";
    url += userId + "/";
    url += "projects/" + projectId + "/";
    url += "queries/";
    url += encodeURIComponent(queryId) + "/";
    url += operation;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (!respData) {
            callback(null);
          } else if (respData.error) {
            callback(new APIError(respData.error));
          } else {
            callback(respData);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send({});
  };
}
