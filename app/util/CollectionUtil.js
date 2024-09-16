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
    lookupMapping = true,
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

  //make sure this works also by passing the stats
  static generateCollectionConfig = async (
    clientId,
    user,
    collectionId,
    callback,
    lookupMapping = true,
  ) => {
    const configClass = CollectionUtil.getCollectionClass(
      clientId,
      user,
      collectionId,
      lookupMapping,
      user,
    );

    //load the stats & information asynchronously TODO (rewrite to promise is nicer)
    const collectionMetadata =
      await CollectionUtil.__loadCollectionMetadata(collectionId);
    callback(new configClass(clientId, user, collectionId, collectionMetadata));
  };

  //loads the Elasticsearch stats of the provided collection
  static __loadCollectionMetadata = (collectionId) => {
    return new Promise((resolve) => {
      if (!collectionId) resolve(null);
      CollectionRegistryAPI.getCollectionMetadata(collectionId, resolve);
    });
  };
}
