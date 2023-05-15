import CollectionConfig from "./CollectionConfig";

export default class KBNewspaperAggrConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["text"];

  getPreferredDateField = () => "paperDate";

  getMatchingTermsMsg = (numHits, forSnippet) => {
    if (forSnippet) {
      return numHits !== 0
        ? numHits + " match(es) in archival metadata |"
        : " No matches in the archival metadata, matching terms found in the OCR";
    } else {
      return numHits <= 0
        ? "No matching terms found in archival metadata (see OCR in KB Delpher)"
        : "Matching terms in archival metadata";
    }
  };

  getMinimumYear = () => 1600;
  getMaximumYear = () => -1;

  getMetadataFieldCategories = () => [
    {
      id: "articleTitles",
      label: "article title",
      fields: ["articleTitle"],
    },
    {
      id: "paperTitles",
      label: "newspaper title",
      fields: ["paperTitle"],
    },
    {
      id: "ocr",
      label: "article text (OCR)",
      enrichment: true,
      fields: ["articleBody"],
    },
    {
      id: "publication",
      label: "place of publication",
      fields: ["placeOfPublication"],
    },
    {
      id: "origin",
      label: "origin (herkomst)",
      fields: ["origin"],
    },
  ];

  getFacets = () => [
    {
      field: "century",
      title: "Periode",
      id: "periode",
      type: "string",
    },
    {
      field: "articleType",
      title: "Soort bericht",
      id: "soort",
      type: "string",
    },
    {
      field: "distributionArea.keyword",
      title: "Verspreidingsgebied",
      id: "verspreidingsgebied",
      type: "string",
    },
  ];

  getKeywordFields = () => {
    //ArticleBody
    //ArticleTitle
    //Is part of
    //paperPDFUrl
    //publisher
    const filteredKeywordFields = [];
    for (let i = 0; i < this.keywordFields.length; i++) {
      if (
        this.keywordFields[i] !== "articleBody.keyword" &&
        this.keywordFields[i] !== "articleTitle.keyword" &&
        this.keywordFields[i] !== "isPartOf" &&
        this.keywordFields[i] !== "paperPDFUrl" &&
        this.keywordFields[i] !== "publisher.keyword"
      ) {
        filteredKeywordFields.push(this.keywordFields[i]);
      }
    }
    return filteredKeywordFields;
  };

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) => esFieldName;

  // Sorted by preference for the front end
  /*getPreferredHighlightFields = () => [
        'rightsHolder',
        'articleTitle',
        'articleBody',
        'distributionArea',
        'paperDate',
        'origin',
        'language',
        'isPartOf',
        'paperTitle',
        'frequency',
        'century',
        'articleType',
        'placeOfPublication',
        'publisher',
        'accessRights'
    ];*/

  /*getHighlightFields = () => [
        'articleTitle',
        'articleBody',
        'paperTitle',
        'distributionArea',
        'placeOfPublication',
        'rightsHolder',
        'paperDate',
        'origin',
        'language',
        'isPartOf',
        'frequency',
        'century',
        'articleType',
        'publisher',
        'accessRights'
	];*/

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  getFieldsToExclude = () => ["articleBody"];

  isResourcePlayable = (mappedResource) => false; // eslint-disable-line no-unused-vars
}
