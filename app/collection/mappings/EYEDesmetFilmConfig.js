import CollectionConfig from "./CollectionConfig";

export default class EYEDesmetFilmConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["video"];

  getMinimumYear = () => 1900;
  getMaximumYear = () => 1994;

  requiresPlayoutAccess = () => true;

  getAnonymousUserRestrictions = () => ({
    prohibitThumbnails: false, // show thumbnails in search results
    prohibitPlayout: true, // playing content
    prohibitedLayers: [], // allow all content annotation layers
    prohibitTranscripts: false, // allow transcripts
  });

  // format accepted are : yyyy with some records containing strings added to it.
  getFormattedDates = (date) => {
    if (date && typeof date === "string") {
      const newTimeStamp = new Date(date.trim()).getTime();
      if (isNaN(newTimeStamp)) {
        // assuming yyyy1; yyyy2 format. Evaluating if the first year is actually a numeric year
        return !isNaN(date.substr(0, 4)) ? [date.substr(0, 4)] : null;
      } else {
        return [date.trim()];
      }
    }
    return null;
  };

  getKeywordFields = () => {
    let keywordFields = [];
    for (let i = 0; i < this.keywordFields.length; i++) {
      if (
        this.keywordFields[i].toLowerCase().indexOf("datum") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("jaar") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("synopsis") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("bron") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("affiches") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("diva") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("curator's comments") ===
          -1 &&
        this.keywordFields[i].toLowerCase().indexOf("filmbestand") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("overige informatie") ===
          -1 &&
        this.keywordFields[i].toLowerCase().indexOf("toelichting") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("url") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("video") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("title") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("titel") === -1 &&
        this.keywordFields[i].toLowerCase().indexOf("beschrijving") === -1
      ) {
        keywordFields.push(this.keywordFields[i]);
      }
    }
    return keywordFields;
  };

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: [
        "Gegeven titel",
        "Originele titel",
        "Mogelijke titel",
        "Basement titel",
        "Basement engelse titel",
        "Basement engelse sorteertitel",
        "Basement sorteertitel",
        "Buitenlandse release-titel",
        "Vertaalde titel",
        "Voormalige titel EYE",
        "Alternatieve titel",
        "Tussentitels",
        "Nederlandse titel",
        "Verzameltitel amateurfilm",
        "Campagnetitel reclame",
        "Producttitel reclame",
        "Aanloopstrooktitel",
        "Soort en titel",
        "Serietitel",
        "Episodetitel",
        "Werktitel",
        "Bliktitel",
        "Kopietitel",
      ],
    },
    {
      id: "descriptions",
      label: "Descriptions",
      fields: [
        "Lange beschrijving",
        "Korte beschrijving",
        "Basement browse synopsis (EN)",
        "Basement browse synopsis (NL)",
        "Basement schat synopsis (EN)",
        "Basement schat synopsis (NL)",
        "Film-in-Nederland synopsis (EN)",
        "Film-in-Nederland synopsis (NL)",
      ],
    },
  ];

  getFacets = () => [
    {
      field: "Acteur.keyword",
      title: "Acteur",
      id: "acteur",
      type: "string",
    },
    {
      field: "Productiemaatschappij.keyword",
      title: "Productiemaatschappij",
      id: "productiemaatschappij",
      type: "string",
    },
  ];

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) => esFieldName.replace(".keyword", "");
}
