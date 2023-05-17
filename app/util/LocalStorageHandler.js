import LZString from "lz-string"; //for compressing large search results that are put in local storage

export default class LocalStorageHandler {
  //TODO add proper validation
  static VALID_KEYS = {
    //used to store a SearchResults object obtained after calling the SearchAPI
    "stored-search-results": { type: "object", compress: true }, //SearchResults.toLocalStorageObject()

    //used to store the priority query, so it can be run by passing the query=prio param (single search)
    "stored-priority-query": { type: "object", compress: false }, //Query

    //used to remember selected search results across the media suite
    "stored-selections": { type: "array", compress: false }, //containing objects with: key=resourceId value=SearchResult

    //used to remember the active project across the media suite
    "stored-active-project": { type: "object", compress: false }, //Project

    //used when clicking on an item in the result list
    "stored-visited-results": { type: "array", compress: false }, //containing strings

    //whether the user wants to show/hide the time line on the search page
    "state-show-timeline": { type: "boolean", compress: false },

    //whether the user wants to show/hide the keyword histogram on the search page
    "state-show-keyword-histogram": { type: "boolean", compress: false },

    //whether the user wants to have the facets selection locked on the search page
    "state-facets-locked": { type: "boolean", compress: false },

    //store active (if any has been selected) collection id.
    "active-collection-id": { type: "string", compress: false },

    //collections ids selected in Collection inspector.
    "stored-cids": { type: "string", compress: false },

    //queries selected for further query processing (see ProjectQueriesView)
    "stored-query-selection": { type: "object", compress: false },

    //the amount of projects in your workspace
    "stored-project-count": { type: "number", compress: false },

    //the amount of personal collections in your workspace
    "stored-personal-collection-count": { type: "number", compress: false },
  };

  static supportsHTML5Storage = () => {
    try {
      return "localStorage" in window && window["localStorage"] !== null;
    } catch (e) {
      return false;
    }
  };

  static checkLocalStorageKey = (key, mustExist) => {
    if (key in LocalStorageHandler.VALID_KEYS) {
      if (!mustExist || (mustExist && localStorage.getItem(key))) {
        return true;
      }
    }
    return false;
  };

  //TODO turn this into something that tries to construct & validate the actual object/class based on the stored JSON data
  static checkProptype = (key, data) => {
    let propType = "";
    if (Array.isArray(data)) {
      propType = "array";
    } else {
      propType = typeof data;
    }
    return propType === LocalStorageHandler.VALID_KEYS[key].type;
  };

  /*--------------------------------------------------------------------------------
	* ------------------------- CRUD OF JSON OBJECTS IN LOCALSTORAGE -----------------
	---------------------------------------------------------------------------------*/

  static shouldCompress = (key) => {
    return LocalStorageHandler.VALID_KEYS[key].compress;
  };

  //Note: localStorage stored class objects like a simple JSON structure without functions.
  //When retrieving the object, don't expect the functions to be there, instead use Object.construct to recreate the original object
  static storeJSONInLocalStorage = (key, data) => {
    if (
      LocalStorageHandler.supportsHTML5Storage() &&
      LocalStorageHandler.checkLocalStorageKey(key, false)
    ) {
      if (LocalStorageHandler.checkProptype(key, data)) {
        try {
          if (data === null) {
            localStorage.removeItem(key);
          } else {
            const dataToStore = LocalStorageHandler.shouldCompress(key)
              ? LZString.compress(JSON.stringify(data))
              : JSON.stringify(data);
            localStorage.setItem(key, dataToStore);
          }
          return true;
        } catch (e) {
          console.error(e);
        }
      } else {
        console.error("Trying to store the wrong kind of data for key: " + key);
      }
    }
    return false;
  };

  //TODO possibly extend with an option to cast the JSON back to the original object (see the model package)
  static getJSONFromLocalStorage = (key) => {
    if (
      LocalStorageHandler.supportsHTML5Storage() &&
      LocalStorageHandler.checkLocalStorageKey(key, true)
    ) {
      try {
        let loadedData = localStorage.getItem(key);
        loadedData = LocalStorageHandler.shouldCompress(key)
          ? LZString.decompress(loadedData)
          : loadedData;
        return JSON.parse(loadedData);
      } catch (e) {
        console.error(e);
      }
    }
    return null;
  };

  static removeJSONByKeyInLocalStorage = (key) => {
    if (
      LocalStorageHandler.supportsHTML5Storage() &&
      LocalStorageHandler.checkLocalStorageKey(key, true)
    ) {
      try {
        localStorage.removeItem(key);
        return true;
      } catch (e) {
        console.error(e);
      }
    }
    return false;
  };

  /*--------------------------------------------------------------------------------
    * ------------------------- HIGH-LEVEL CONVENIENCE FUNCTIONS ---------------------
    ---------------------------------------------------------------------------------*/

  static storeQueries = (project, queryIds) => {
    if (!project || !queryIds) return;

    LocalStorageHandler.storeJSONInLocalStorage("stored-query-selection", {
      projectId: project.id,
      queryIds: queryIds,
    });
  };

  static getStoredQueries = () => {
    return LocalStorageHandler.getJSONFromLocalStorage(
      "stored-query-selection"
    );
  };

  static updateStoredQueries = (project, queriesToDelete) => {
    if (!project || !queriesToDelete) return;

    const queryData = LocalStorageHandler.getStoredQueries();
    if (!queryData || !queryData.queryIds || queryData.projectId !== project.id)
      return;

    queriesToDelete.forEach((nq) => {
      if (queryData.queryIds.includes(nq.query.id)) {
        queryData.queryIds.splice(queryData.queryIds.indexOf(nq.query.id), 1);
      }
    });
    LocalStorageHandler.storeQueries(project, queryData.queryIds);
  };
}
