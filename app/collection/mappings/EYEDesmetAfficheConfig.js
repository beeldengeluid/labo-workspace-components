import CollectionConfig from "./CollectionConfig";

export default class EYEDesmetAfficheConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["image"];

  getMinimumYear = () => 1900;
  getMaximumYear = () => 1935;

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: ["Subtitels", "Affichetitel", "Filmwerk"],
    },
  ];

  // Based on the Jaar field, the following variations are found
  // 1) yyyy
  // 2) yyyy weirdString (e.g. 1914 ([?]))
  // 3) yyyy - yyyy (e.g. the period of "1916 - 1920")
  // 4) yyyy - yyyy weird String (e.g. "1914  ([?])")
  getFormattedDates = (date) => {
    if (date) {
      if (typeof date === "string") {
        if (date.indexOf("-") === -1) {
          //variant 1 or 2
          return [date.trim().substring(0, 4)];
        } else {
          //variant 3 or 4
          const tmp = date.split(" ");
          return [tmp[0] + " - " + tmp[2]];
        }
      } else if (typeof date === "object") {
        //array
        console.debug("this should never happen");
      }
    }
    return null;
  };

  getFacets = () => [
    {
      field: "Land.keyword",
      title: "Country",
      id: "country",
      type: "string",
    },
    {
      field: "Drukker.keyword",
      title: "Printer",
      id: "printer",
      type: "string",
    },
    {
      field: "Beschadiging.keyword",
      title: "Damage",
      id: "damage",
      type: "string",
    },
  ];

  // eslint-disable-next-line no-unused-vars
  getItemDetailData = (result, currentDateField) => {
    //client side only operation: set the Mediaobjects to cors = false, so OpenSeaDragon is not used
    if (result.playableContent) {
      result.playableContent.forEach((mo) => (mo.cors = false));
    }
    return result;
  };

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) => esFieldName.replace(".keyword", "");
}
