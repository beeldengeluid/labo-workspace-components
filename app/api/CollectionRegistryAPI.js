const CollectionRegistryAPI = {
  //Fetches the list of collections via the LABO proxy (which harvests directly from CKAN)
  listCollections: function (callback) {
    const url = _config.COLLECTION_REGISTRY_API_BASE;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const resp = JSON.parse(xhr.responseText);
          callback(resp.error ? null : resp);
        } else {
          callback(null);
        }
      }
    };
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  },

  getCollectionMetadata: function (collectionId, callback) {
    const url = _config.COLLECTION_REGISTRY_API_BASE + "/" + collectionId;
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          let resp = null;
          try {
            resp = JSON.parse(xhr.responseText);
          } catch (e) {
            console.debug("no valid json");
          }
          if (resp["error"] !== undefined) {
            callback(null);
          } else {
            callback(resp);
          }
        } else {
          callback(null);
        }
      }
    };
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.send();
  },
};

export default CollectionRegistryAPI;
