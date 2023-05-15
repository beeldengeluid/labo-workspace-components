import CollectionConfig from "./CollectionConfig";

export default class RadioOranjeConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["audio"];
  getMinimumYear = () => 1940;
  getMaximumYear = () => 1945;
  getPreferredDateField = () => "release_date";

  requiresPlayoutAccess = () => true;

  getKeywordFields() {
    let keywordFields = super.getKeywordFields();
    keywordFields.push("hasText");
    return keywordFields;
  }

  getFacets = () => [
    {
      field: "hasText",
      title: "Has transcript",
      id: "hastext",
      type: "int",
    },
    {
      field: "daanData.series.genre.keyword",
      title: "Genre (series)",
      id: "genre",
      type: "string",
    },
    {
      field: "daanData.program.subjectterm.keyword",
      title: "Keyword",
      id: "keyword",
      type: "string",
    },
  ];

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: [
        "title",
        "original_title",
        "daanData.series.title",
        "daanData.season.title",
        "daanData.program.title",
        "daanData.logTrackItems.ltSceneDesc.title", //for scene descriptions
      ],
    },
    {
      id: "descriptions",
      label: "Descriptions",
      fields: [
        "description",
        "daanData.program.summaryshort",
        "daanData.program.summary",
        "daanData.logTrackItems.ltSceneDesc.summary", //for scene descriptions
      ],
    },
    {
      id: "text",
      label: "Transcribed text",
      fields: ["text"],
    },
  ];

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars
}
