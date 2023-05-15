import CollectionConfig from "./CollectionConfig";

export default class OpenBeeldenNISVConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["video"];

  getMinimumYear = () => 1899;
  getMaximumYear = () => -1;

  getPreferredLanguage = () => "nl";

  getPreferredDateField = () => "@graph.dcterms:date";

  getFacets = () => [
    {
      field: "@graph.dcterms:subject.@value.keyword",
      title: "Subject",
      id: "subject",
      type: "string",
    },
    {
      field: "@graph.dcterms:date",
      title: "Date",
      id: "date",
      type: "date_histogram",
    },
    {
      field: "@graph.dcterms:spatial.@value.keyword",
      title: "Spatial",
      id: "spatial",
      type: "string",
    },
    {
      field: "@graph.dcterms:language",
      title: "Language",
      id: "language",
      type: "string",
    },
    {
      field: "@graph.dcterms:publisher",
      title: "Publisher",
      id: "publisher",
      type: "string",
    },
  ];

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: ["@graph.dcterms:title.@value"],
    },
    {
      id: "subjects",
      label: "Subject keywords",
      fields: ["@graph.dcterms:subject.@value"],
    },
  ];

  // Format date according to yyyy-mm-dd format or returns null
  getFormattedDates = (date) =>
    date && typeof date === "string" ? [date] : null;

  //currentDateField is always the dcterms:date field, so no need to check for it
  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  //TODO this was used in the old LD components (not there anymore)
  /*
	predicateToIndexField(predicate) {
		const prefixes = {
			'http://purl.org/dc/terms/' : 'dcterms',
			'http://creativecommons.org/ns#' : 'cc'
		};

		const langAttributes = [
			'abstract', 'alternative', 'attributionName', 'creator', 'description', 'mediator',
			'source', 'spatial', 'subject', 'title'
		];

		const prefix = Object.keys(prefixes).find((key) => predicate.indexOf(key) !== -1);
		if(prefix) {
			const fieldName = predicate.substring(prefix.length);
			const langParam = langAttributes.indexOf(fieldName) === -1 ? '' : '.@value';
			const keywordField = '@graph.' + prefixes[prefix] + ':' + fieldName + langParam;

			//make sure the predicate matches with a keyword field, otherwise it cannot be used to facet on
			return this.getMatchedKeywordField(keywordField);
		}
		return null; //means this predicate cannot be faceted on
	}*/
}
