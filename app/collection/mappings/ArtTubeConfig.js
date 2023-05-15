import CollectionConfig from "./CollectionConfig";

export default class ArtTubeConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, stats) {
    super(clientId, user, collectionId, stats);
  }

  getCollectionMediaTypes = () => ["video"];
}
