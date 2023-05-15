import Project from "../model/Project";
import LocalStorageHandler from "../util/LocalStorageHandler";

//TODO make sure *all* calls make use of the ObjectModelUtil to ensure proper project objects!
//TODO check to see if the response contains the 'error' key/value
export default class ProjectAPI {
  static save = (userId, project, callback, store = true) => {
    let url = _config.PROJECT_API_BASE + "/" + userId + "/projects";
    let method = "POST";
    if (project.id) {
      url += "/" + project.id;
      method = "PUT";
    }
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error) {
            const project = Project.construct(respData);
            if (store) {
              LocalStorageHandler.storeJSONInLocalStorage(
                "stored-active-project",
                project.toLocalStorageObject()
              );
            }
            callback(project);
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
    xhr.send(JSON.stringify(project.toServerObject()));
  };

  static delete = (userId, projectId, callback) => {
    const storedProject = LocalStorageHandler.getJSONFromLocalStorage(
      "stored-active-project"
    );
    const url =
      _config.PROJECT_API_BASE + "/" + userId + "/projects/" + projectId;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error) {
            //if the active project is deleted make sure to remove it from the local storage
            if (storedProject && projectId === storedProject.id) {
              LocalStorageHandler.removeJSONByKeyInLocalStorage(
                "stored-active-project"
              );
            }
            callback(respData);
          } else {
            callback(null);
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

  static list = (userId, filter, callback) => {
    // todo: add filters to request
    const url = _config.PROJECT_API_BASE + "/" + userId + "/projects";
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error && typeof respData === "object") {
            LocalStorageHandler.storeJSONInLocalStorage(
              "stored-project-count",
              respData.length
            );
            callback(respData.map((p) => Project.construct(p)));
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

  static get = (userId, projectId, callback) => {
    const url =
      _config.PROJECT_API_BASE +
      "/" +
      userId +
      "/projects/" +
      encodeURIComponent(projectId);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const respData = JSON.parse(xhr.responseText);
          if (respData && !respData.error) {
            callback(Project.construct(respData));
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
}
