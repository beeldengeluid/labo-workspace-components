import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class DANSOralHistoryConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
    // Filter the unnecessary fields...
    this.keywordFields = this.__filterKeywordFields();
  }

  //only required for verhalenhuis. Other media objects have requiresPlayoutAccess = false
  requiresPlayoutAccess = () => true;

  __filterKeywordFields = () => {
    const filteredFields = [];

    // Add the two default fields
    filteredFields.push("mediaType");
    filteredFields.push("playable");

    // Check for more options
    if (this.keywordFields) {
      for (let i = 0; i < this.keywordFields.length; i++) {
        //Must contain @graph and keyword and don't contain description, abstract or source (not useful facet fields)
        if (
          this.keywordFields[i].indexOf("@graph") !== -1 &&
          this.keywordFields[i].indexOf("keyword") !== -1 &&
          this.keywordFields[i].indexOf("description") === -1 &&
          this.keywordFields[i].indexOf("abstract") === -1 &&
          this.keywordFields[i].indexOf("source") === -1
        ) {
          filteredFields.push(this.keywordFields[i]);
        }
      }
    }
    return filteredFields;
  };

  getMinimumYear = () => 1982;
  getMaximumYear = () => -1;

  //gets the fields for showing highlights in search snippets, in order of preference
  // Set the actual query highlight fields in getHighlightFields()
  /*getPreferredHighlightFields = () => [
		'layer__asr.words',
		'dcterms:subject',
		'@graph.dcterms:subject',
		'@graph.dcterms:spatial',
		'@graph.dcterms:creator',
		'@graph.dcterms:accessRights',
		'@graph.dcterms:type',
		'@graph.dcterms:format',
		'@graph.dcterms:temporal',
		'@graph.dcterms:created',
		'@graph.dcterms:modified',
		'@graph.dcterms:references',
		'@graph.dcterms:publisher',
		'@graph.dcterms:issued',
		'@graph.dcterms:available',
		'@graph.dcterms:rightsholder',
		'@graph.dcterms:isPartOf',
		'@graph.dcterms:abstract'
	];*/

  // Used for creating the query
  // Quite a bit of fields here are not neccessary for highlights?
  // -> move highlighting from JS to python, clean up this list then.
  // -> this list is here because these fields are not in the 'simple search hit' shown in the results
  // getHighlightFields = () => [
  // 	'layer__asr.words',
  // 	'@graph.dcterms:subject',
  // 	'@graph.dcterms:spatial',
  // 	'@graph.dcterms:creator',
  // 	'@graph.dcterms:accessRights',
  // 	'@graph.dcterms:type',
  // 	'@graph.dcterms:format',
  // 	'@graph.dcterms:temporal',
  // 	'@graph.dcterms:created',
  // 	'@graph.dcterms:modified',
  // 	'@graph.dcterms:references',
  // 	'@graph.dcterms:publisher',
  // 	'@graph.dcterms:issued',
  // 	'@graph.dcterms:available',
  // 	'@graph.dcterms:rightsholder',
  // 	'@graph.dcterms:isPartOf'
  // ];

  getForbiddenHighlightFields = () => ["url", "contentServerId"];

  getFieldsToExclude = () => ["layer__asr"];

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: ["@graph.dcterms:title"],
    },
    {
      id: "descriptions",
      label: "Descriptions",
      fields: ["@graph.dcterms:abstract"],
    },
    {
      id: "subject metadata",
      label: "Subject keywords",
      fields: ["@graph.dcterms:subject"],
    },
    {
      id: "asr",
      label: "Speech transcripts (ASR)",
      enrichment: true,
      fields: ["layer__asr.words"],
    },
  ];

  getFacets = () => [
    {
      field: "mediaType",
      title: "mediaType",
      id: "mediaType",
      type: "string",
    },
    {
      field: "@graph.dcterms:isPartOf.keyword",
      title: "Oral history collection",
      id: "thematic_collection",
      type: "string",
    },
    {
      field: "@graph.dcterms:creator.keyword",
      title: "Creator",
      id: "creator",
      type: "string",
    },
    {
      field: "@graph.dcterms:subject.keyword",
      title: "Subject",
      id: "subject",
      type: "string",
    },
    {
      field: "@graph.dcterms:accessRights.keyword",
      title: "Access rights",
      id: "access_rights",
      type: "string",
    },
    {
      field: "@graph.dcterms:format.keyword",
      title: "Media format",
      id: "media_format",
      type: "string",
    },
  ];

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  // Date formats accepted are either:
  // date: "2009-09-20; 2009-03-21"
  // date: "2010-03-21"
  // date: "2008"
  // date: "1984; 1983"
  // date" "1984; 1983; 2009-11-02"
  // date: "2009-05-20; 2008-08-30; 2009-05-22"
  // check if there's a ; meaning more than one date
  // It returns the earliest date (from a string containing 1 or more dates) as a Timestamp or null
  getFormattedDates = (date) => {
    if (date && typeof date === "string") {
      if (date.trim().indexOf(";") !== -1) {
        return date.split(";").map((it) => it.trim());
      } else {
        return [date.trim()];
      }
    }
    return null;
  };

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) => {
    if (!esFieldName) return esFieldName;

    if (esFieldName === "layer__asr.words") {
      return "Speech transcript";
    }

    //first split the field based on a dot
    let tmp = esFieldName.split(".");
    // remove namespaces
    tmp = tmp.map((field) => field.substring(field.indexOf(":") + 1));
    //if the last field is called raw or keyword (ES reserved names), drop it
    if (tmp[tmp.length - 1] === "raw" || tmp[tmp.length - 1] === "keyword") {
      tmp.pop();
    }
    return tmp.pop();
  };

  // returns the first media object that matches the search term in the accompanied transcript
  findMatchingMediaFragments = (
    resource,
    searchTerm,
    activeMediaObject = null
  ) => {
    if (!resource.transcripts) return null;

    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex");
    }
    if (!regex) {
      return null;
    }

    let firstMatch = null;
    for (let assetId of Object.keys(resource.transcripts)) {
      // first look for a match
      firstMatch = resource.transcripts[assetId].find((t) => {
        return (
          t.lines
            .map((l) => l.text)
            .join(" ")
            .search(regex) !== -1
        );
      });

      // stop searching if the activeMediaObject was checked
      if (activeMediaObject && activeMediaObject.assetId === assetId) {
        break;
      }
      if (firstMatch != null) {
        break;
      }
    }

    return firstMatch
      ? resource.playableContent.find(
          (mo) => mo.assetId === firstMatch.mediaObjectId
        )
      : null;
  };
}
