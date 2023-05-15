import CollectionRegistryAPI from "../api/CollectionRegistryAPI";

import CollectionConfig from "../collection/mappings/CollectionConfig";
import CollectionMapping from "../collection/mappings/CollectionMapping";

export default class CollectionUtil {
  //returns the correct CollectionConfig instance based on the collectionId
  // TODO: Please note: clientId / user are not used in the call.
  static getCollectionClass = (
    clientId,
    user,
    collectionId,
    lookupMapping = true
  ) => {
    let configClass = null;
    if (lookupMapping) {
      configClass = CollectionMapping[collectionId];
      if (configClass === undefined) {
        //go through the wildcard mappings
        const temp = Object.keys(CollectionMapping).filter((k) => {
          if (k.indexOf("*") !== -1) {
            return (
              collectionId &&
              collectionId.startsWith(k.substring(0, k.length - 2))
            );
          }
          return false;
        });
        configClass = temp.length === 1 ? CollectionMapping[temp[0]] : null;
      }
    }
    if (configClass === null || !lookupMapping) {
      configClass = CollectionConfig;
    }
    return configClass;
  };

  //called by the CollectionSelector only
  static createCollectionConfig = (
    clientId,
    user,
    collectionId,
    collectionMetadata
  ) => {
    const configClass = CollectionUtil.getCollectionClass(
      clientId,
      user,
      collectionId,
      true
    );
    return new configClass(clientId, user, collectionId, collectionMetadata);
  };

  static generateCollectionConfigs = (
    clientId,
    user,
    collectionIds,
    callback,
    lookupMapping = true
  ) => {
    const configs = [];
    collectionIds.forEach((cid) => {
      CollectionUtil.generateCollectionConfig(
        clientId,
        user,
        cid,
        (config) => {
          configs.push(config);
          if (configs.length === collectionIds.length) {
            callback(configs);
          }
        },
        lookupMapping
      );
    });
  };

  //make sure this works also by passing the stats
  static generateCollectionConfig = async (
    clientId,
    user,
    collectionId,
    callback,
    lookupMapping = true
  ) => {
    const configClass = CollectionUtil.getCollectionClass(
      clientId,
      user,
      collectionId,
      lookupMapping,
      user
    );

    //load the stats & information asynchronously TODO (rewrite to promise is nicer)
    const collectionMetadata = await CollectionUtil.__loadCollectionMetadata(
      collectionId
    );
    callback(new configClass(clientId, user, collectionId, collectionMetadata));
  };

  //loads the Elasticsearch stats of the provided collection
  static __loadCollectionMetadata = (collectionId) => {
    return new Promise((resolve) => {
      if (!collectionId) resolve(null);
      CollectionRegistryAPI.getCollectionMetadata(collectionId, resolve);
    });
  };

  //extract the workspace collection ID from the collectionID (by stripping off the user id + prefix)
  static __toWorkspaceAPICollectionId = (clientId, user, collectionId) => {
    if (collectionId.indexOf("pc__") !== -1 && user) {
      return collectionId.substring(
        "pc__".length + clientId.length + user.id.length + 4
      );
    }
    return collectionId;
  };

  /*------------------------------------------------------------------------
	------------------------ MISC FUNCTIONS TO BE (RE)MOVED ------------------
	------------------------------------------------------------------------*/

  static SEARCH_LAYER_MAPPING = {
    srt: "Subtitles",
    asr: "ASR",
    ocr: "OCR",
    topics: "Man-made annotations",
    enrichments: "Man-made annotations",
    default: "Collection metadata",
  };

  static getSearchLayerName = (collectionId, index) => {
    if (index === collectionId) {
      return CollectionUtil.SEARCH_LAYER_MAPPING["default"];
    }
    let label = "Unknown";
    const temp = index.split("__");
    if (temp.length > 1) {
      label = CollectionUtil.SEARCH_LAYER_MAPPING[temp[1]];
      label = label ? label : "";
      if (temp.length === 3) {
        label += " " + temp[2];
      }
    }
    return label;
  };
}
