import MetadataSchemaUtil from "../../util/MetadataSchemaUtil";
import ElasticsearchDataUtil from "../../util/ElasticsearchDataUtil";

/*
TODO:
- nadenken hoe automatisch facets te genereren
- apart component maken voor zoeken in fragmenten
- component met audio player
- play-out van een fragment goed integreren (b.v. vanuit woordenwolk naar player)
- make sure the config 'knows' which kind of view it should generate data for
*/

//base class for each collection configuration
export default class CollectionConfig {
  //requires the output of [SEARCH_API]/api/v1/collections/show_stats?collectionId=[ID]
  constructor(clientId, user, collectionId, collectionMetadata) {
    this.clientId = clientId;
    this.user = user;
    this.collectionId = collectionId; //based on the ES index/alias name
    this.collectionMetadata = collectionMetadata; //contains ES stats, field desriptions & collection_metadata (CKAN)

    this.docType = null;
    this.stringFields = [];
    this.textFields = [];
    this.dateFields = [];
    this.nonAnalyzedFields = [];
    this.keywordFields = [];
    this.longFields = [];
    this.doubleFields = [];
    this.nestedFields = [];

    if (collectionMetadata && collectionMetadata.collection_statistics) {
      let temp = null;

      //extract the preferred doc type
      if (collectionMetadata.collection_statistics) {
        collectionMetadata.collection_statistics.forEach((dt) => {
          if (temp == null) {
            temp = dt;
          } else if (dt && temp.doc_count < dt.doc_count) {
            temp = dt;
          }
        });
        this.docType = temp.doc_type;
      }

      //extract the field info
      if (temp && temp.fields) {
        //merged in getStringFields(). ES5 uses 'text' and older versions only use 'string'
        this.stringFields = temp.fields["string"];
        this.textFields = temp.fields["text"];

        //merged in getNonAnalyzedFields()
        this.nonAnalyzedFields = temp.fields["not_analyzed"];

        if (temp.fields["keyword"]) {
          this.keywordFields = temp.fields["keyword"];
        }

        this.dateFields = temp.fields["date"];
        this.longFields = temp.fields["long"];
        this.doubleFields = temp.fields["double"];
        this.nestedFields = temp.fields["nested"];
      }
    }
  }

  getCollectionMediaTypes() {
    return [];
  }

  //Important for generating replacable PIDs for playable content; should override!
  getNamespace() {
    return "http://" + this.collectionId.replace(/-/g, ".");
  }

  //TODO see if this is necessary or we just directly access the global variable
  getCollectionId() {
    return this.collectionId;
  }

  //checks if there is a proper title / name from CKAN / workspace API, otherwise just returns the ID
  getCollectionTitle() {
    if (this.collectionMetadata) {
      return this.collectionMetadata.title;
    }
    return null;
  }

  getCollectionMetadata() {
    return this.collectionMetadata;
  }

  //TODO this will become a much more important function later on
  //FIXME make the difference between CKAN / workspace API versions of the collection metadata less weird
  getSearchIndex() {
    let searchIndex = this.collectionId;
    if (this.collectionMetadata) {
      searchIndex = this.collectionMetadata.index;
      if (
        !searchIndex &&
        this.collectionMetadata.user &&
        this.collectionMetadata.id
      ) {
        //TODO check this on the server (user & id)
        searchIndex =
          "pc__" +
          this.clientId +
          "__" +
          this.collectionMetadata.user +
          "__" +
          this.collectionMetadata.id;
      }
    }
    return searchIndex;
  }

  getImageBaseUrl() {
    return null;
  }

  getVideoBaseUrl() {
    return null;
  }

  getAudioBaseUrl() {
    return null;
  }

  requiresPlayoutAccess() {
    return false;
  }

  //by default anonymous users are able to do anything with the collections that are granted for them
  //only in rare cases parts of a collection are closed off, therefore the "prohibition approach" is chosen
  getAnonymousUserRestrictions() {
    return {
      prohibitThumbnails: false, // show thumbnails in search results
      prohibitPlayout: false, // playing content
      prohibitedLayers: [], // allow all content annotation layers
      prohibitTranscripts: false, // allow transcripts
    };
  }

  hideOffAirContent() {
    return false;
  }

  getThumbnailContentServerId() {
    return null;
  }

  getDocumentType() {
    return this.docType;
  }

  //CURRENT this gets the layers from additional indices with the __[LAYER NAME] suffix
  getCollectionIndices() {
    const indices = [this.getCollectionId()];
    const stats = this.getCollectionMetadata();
    if (stats && stats["collection_annotation_indices"]) {
      return indices.concat(
        stats["collection_annotation_indices"].map((i) => {
          return i.collection;
        })
      );
    }
    return indices;
  }

  //used whenever you want to search by default in nested documents (only when no field categories/clusters are selected)
  //should return an object like this: {path : 'layer__asr', fields : ['layer__asr.words']}
  getNestedSearchLayers() {
    return null;
  }

  //the nested path used for forming the ES query in the search API
  getFragmentPath() {
    return null;
  }

  //which of the fragment fields are text fields and suitable for match queries?
  getFragmentTextFields() {
    return null;
  }

  //by default enable & disable when a fragment path is set
  includeMediaObjects(searchTerm = null) {
    //always include media objects when there is no search term
    if (!searchTerm || searchTerm == "") return true;

    //otherwise look if there is a fragment path, if so EXCLUDE media objects
    //(so only documents of the doctype media_fragment are returned)
    return this.getFragmentPath() == null ? true : false;
  }

  //by default never return the children of nested documents
  includeFragmentChildren() {
    return false;
  }

  getStringFields() {
    let tmp = [];
    if (this.stringFields) {
      tmp = tmp.concat(this.stringFields);
    }
    if (this.textFields) {
      tmp = tmp.concat(this.textFields);
    }
    return tmp.length > 0 ? tmp : null;
  }

  getTextFields() {
    return this.textFields;
  }

  getDateFields() {
    return this.dateFields;
  }

  getNonAnalyzedFields() {
    let tmp = [];
    if (this.nonAnalyzedFields) {
      tmp = tmp.concat(this.nonAnalyzedFields);
    }
    if (this.keywordFields) {
      tmp = tmp.concat(this.keywordFields);
    }
    return tmp.length > 0 ? tmp : null;
  }

  getKeywordFields() {
    return this.keywordFields;
  }

  //checks if the field is a keyword field and makes sure to return the matched keyword field name
  getMatchedKeywordField(fieldName) {
    const kwMatch = this.getKeywordFields().find(
      (kw) => kw.indexOf(fieldName) !== -1
    );
    if (kwMatch) {
      return fieldName === kwMatch ? fieldName : fieldName + ".keyword";
    }
    return null;
  }

  //used by the collection analyzer (field analysis pull down)
  getAllFields() {
    let tmp = [];

    if (this.dateFields) {
      this.dateFields.forEach((f) => {
        tmp.push({
          id: f,
          type: "date",
          keywordMultiField: false,
          title: this.toPrettyFieldName(f),
        });
      });
    }

    if (this.stringFields) {
      this.stringFields.forEach((f) => {
        tmp.push({
          id: f,
          type: "text",
          keywordMultiField: false,
          title: this.toPrettyFieldName(f),
        });
      });
    }
    if (this.textFields) {
      this.textFields.forEach((f) => {
        tmp.push({
          id: f,
          type: "text",
          keywordMultiField: false,
          title: this.toPrettyFieldName(f),
        });
      });
    }

    if (this.longFields) {
      this.longFields.forEach((f) => {
        tmp.push({
          id: f,
          type: "numeric",
          keywordMultiField: false,
          title: this.toPrettyFieldName(f),
        });
      });
    }
    if (this.doubleFields) {
      this.doubleFields.forEach((f) => {
        tmp.push({
          id: f,
          type: "numeric",
          keywordMultiField: false,
          title: this.toPrettyFieldName(f),
        });
      });
    }

    //mark all the nested fields
    tmp.forEach((f) => {
      if (this.nestedFields && this.nestedFields.indexOf(f.id) !== -1) {
        f.nested = true;
      }
    });

    //mark all the fields that are a multi-field keyword field
    if (this.keywordFields) {
      tmp.forEach((f) => {
        if (this.keywordFields.indexOf(f.id + ".keyword") !== -1) {
          f.keywordMultiField = true;
        }
      });
    }
    if (this.nonAnalyzedFields) {
      tmp.forEach((f) => {
        if (this.nonAnalyzedFields.indexOf(f.id + ".raw") !== -1) {
          f.keywordMultiField = true;
        }
      });
    }

    //finally add all the pure keyword fields
    if (this.keywordFields) {
      this.keywordFields.forEach((f) => {
        if (f.indexOf(".keyword") === -1) {
          tmp.push({
            id: f,
            type: "keyword",
            keywordMultiField: false,
            title: this.toPrettyFieldName(f),
          });
        }
      });
    }
    return tmp.length > 0 ? tmp : null;
  }

  usesLayeredModel() {
    return false;
  }

  //simply return the first date field by default (this function is used by QueryBuilder)
  getPreferredDateField() {
    const dfs = this.getDateFields();
    if (dfs && dfs.length > 0) {
      return dfs[0];
    }
    return null;
  }

  //should return an array of formatted date string
  getFormattedDates(date) {
    if (date && typeof date === "string") {
      if (date.match(/^\d/)) {
        return [date.replace(/[^0-9-]/g, "").substring(0, 10)];
      } else {
        return [date.replace(/[^0-9-]/g, "")];
      }
    } else if (date && typeof date === "object") {
      return [date];
    }
    return null;
  }

  //if the data has translations within its metadata
  getPreferredLanguage() {
    return null;
  }

  //Try to generate at least some date facets to be able to draw a timeline
  //TODO the queryDataFormat can be detected from a retrieved date (implement this somewhere)
  getFacets() {
    return ElasticsearchDataUtil.extractFacetsFromStats(
      this.dateFields,
      this.stringFields
    );
  }

  //returns the list of facets for the AggregationCreator
  //(allowHeavyFacets should be used in the sub classes to filter out collection-specific facets that can freeze up the UI, because of too many results)
  // eslint-disable-next-line no-unused-vars
  getFacetSelectionList(allowHeavyFacets) {
    let fields = this.getKeywordFields();
    if (!fields) {
      fields = this.getNonAnalyzedFields();
    }
    if (fields) {
      return fields
        .map((f) => {
          return {
            value: f,
            label: this.toPrettyFieldName(f),
          };
        })
        .sort((a, b) => {
          return a.label > b.label ? 1 : a.label < b.label ? -1 : 0;
        });
    }
    return null;
  }

  //enables the user to narrow down full-text search to certain parts of the top-level metadata (e.g. search only in titles)
  getMetadataFieldCategories() {
    return null;
  }

  /* Function for (LD) entity lookup functions: expects an object like this:
        {
            person : { //currently only person entities are supported
                autocompleteConfig : {
                    'fieldClusters' : ["production-person", "guest-person", "discussed-person"], //for which field category clusters autocomplete is offered
                    'autocompleteVocabulary' : 'GTAA', //vocabulary to use for auto-complete
                    'autocompleteParams' : {'ConceptScheme' : 'http://data.beeldengeluid.nl/gtaa/Persoonsnamen'} //any other parameters, in this case the concept scheme within the vocabulary is specified
                },
                fetchEntityDetails : (entityUri, callback) => {
                    SearchAPI.grlc(
                        'BENG-PERSON-LD',
                        'getPersonDataForGTAAId',
                        {gtaa: entityUri}, //TODO make sure the calling code abstracts the gtaa ID to entity ID
                        NISV_GTAA_WIKIDATA.formatPersonDetails,
                        callback
                    );
                },
                fetchEntitiesInResource : (resourceUri, callback) => {
                    SearchAPI.grlc(
                        'BENG-LD',
                        'getPersonsAndRolesForProgramAndParts',
                        {resource: resourceUri}, //TODO make sure the calling code abstracts the gtaa ID to entity ID
                        NISV_GTAA_WIKIDATA.formatPersonsInResource,
                        callback
                    );
                }
            }
        }
    */
  getEntityConfig() {
    return null;
  }

  //gets the resource's URI in the linked data store
  // eslint-disable-next-line no-unused-vars
  getResourceUri(resourceId) {
    return "";
  }

  //TODO also fetch some data if there is no structured data
  //TODO check if this super function is actually used or always overridden
  getItemDetailData(result, currentDateField = null) {
    //first flatten the pure ES response
    let mappedResource = this.formatSearchResult(result);

    if (!mappedResource) {
      return null;
    }

    //then fetch any data that can be fetched from known schemas (DIDL, DC, ...)
    const structuredData = MetadataSchemaUtil.extractStructuredData(result);
    if (structuredData) {
      mappedResource = Object.assign(structuredData, mappedResource);
    }

    //if there are no title and date try to fetch them via the ES stats or the raw data itself
    if (mappedResource.title == null) {
      if (result.title) {
        mappedResource.title = result.title;
      } else if (this.stringFields != null && this.stringFields.length > 0) {
        mappedResource.title = result[this.stringFields[0]];
      } else {
        mappedResource.title = "<No title available>";
      }
    }
    if (mappedResource.description == null && result.description) {
      mappedResource.description = result.description;
    }
    if (mappedResource.posterURL == null && result.posterURL) {
      mappedResource.posterURL = result.posterURL;
    }
    if (mappedResource.playableContent == null && result.playableContent) {
      mappedResource.playableContent = result.playableContent;
    }
    if (mappedResource.date == null) {
      if (currentDateField && result[currentDateField]) {
        mappedResource.date = result[currentDateField]; //TODO nested fields can't be found in this way!! fix this
        mappedResource.dateField = currentDateField;
      } else if (this.dateFields != null && this.dateFields.length > 0) {
        mappedResource.date = result[this.dateFields[0]];
        mappedResource.dateField = this.dateFields[0];
      } else {
        mappedResource.date = "<No date available>";
        mappedResource.dateField = "<None available>";
      }
    }

    //then add the raw data
    //mappedResource.rawData = result;

    return mappedResource;
  }

  //determines, based on an item processed by getItemDetailData(), if it is playable (overridden by KB only)
  isResourcePlayable(mappedResource) {
    return (
      mappedResource.playable === true ||
      (mappedResource.playableContent &&
        mappedResource.playableContent.length > 0)
    );
  }

  //set the number of extra highlights to add to the search snippet
  getNumberOfHighlightsToDisplay = () => 2;

  //gets the fields for showing highlights in search snippets, in order of preference
  getPreferredHighlightFields = () => [];

  //gets the fields that should never be highlighted
  getForbiddenHighlightFields = () => [];

  // eslint-disable-next-line no-unused-vars
  __getSearchReferences(result) {
    //Returns an object for the metadata table with keys for the left column of the table and a
    // list of {searchTerm, linkText} objects as value for displaying links in the right column
    // See EYEDesmetFilmConfig for an example
    return null;
  }

  //TODO change this to a more index/db agnostic function. Also change the name to formatResource()
  formatSearchResult(result) {
    if (!result) return null;

    const dataRoot = result._source ? result._source : result; //either coming from search or document API
    const formattedResult = JSON.parse(JSON.stringify(dataRoot));

    //always add the raw server data to the rawData prop
    //formattedResult.rawData = JSON.parse(JSON.stringify(dataRoot));

    //add the highlights (only when results come from the search API; never via the document API)
    if (result.highlights) {
      formattedResult.highlights = result.highlights;
    }

    //add the basic fields required by many components (TODO do this on the server)
    formattedResult.resourceId = result._id;
    formattedResult.index = result._index;
    formattedResult.docType = result._type;
    formattedResult.collectionId = this.getSearchIndex();

    //THIS SHOULD BE REMOVED AFTER ALL COLLECTION CONFIGS ARE UPDATED
    formattedResult._id = result._id;
    formattedResult._score = result._score;
    formattedResult._type = result._type;
    formattedResult._index = result._index;

    return formattedResult;
  }

  //this function is used by the UI components to prettify an index field (taken from collection_statistics)
  toPrettyFieldName(esFieldName) {
    const fieldDescription = this._getFieldDescription(esFieldName);
    if (fieldDescription && fieldDescription.en_label) {
      return fieldDescription.en_label;
    } else {
      return this.formatIndexFieldName(esFieldName);
    }
  }

  //standard way to get the field description (with en_label, description) for an index field, don't override
  _getFieldDescription(esFieldName) {
    if (!esFieldName || !this.collectionMetadata) return null;

    const normalizedField =
      ElasticsearchDataUtil.normalizeKeywordField(esFieldName);
    if (
      this.collectionMetadata.field_descriptions &&
      this.collectionMetadata.field_descriptions[normalizedField]
    ) {
      return this.collectionMetadata.field_descriptions[normalizedField];
    }
    return null;
  }

  //default way to format an index field into something more readable
  formatIndexFieldName(esFieldName) {
    if (esFieldName) {
      //first split the field based on a dot
      let tmp = esFieldName.split(".");

      // remove namespaces
      tmp = tmp.map((field) => field.substring(field.indexOf(":") + 1));

      let isKeywordField = false;

      //if the last field is called raw or keyword (ES reserved names), drop it
      if (tmp[tmp.length - 1] === "raw" || tmp[tmp.length - 1] === "keyword") {
        isKeywordField = true;
        tmp.pop();
      }

      let leaf = tmp.pop();

      // move @ to end of fieldname
      if (leaf.substring(0, 1) === "@") {
        leaf = leaf.substring(1) + "@";
      }
      let origin = tmp.join(".");
      if (origin) {
        if (origin.indexOf("@graph") !== -1) {
          origin = origin.substring("@graph.".length);
        }
        if (origin.length > 0 && leaf !== "value@") {
          origin = " => " + origin;
        }
      }
      leaf = leaf === "value@" ? "" : leaf; //always remove value@, since it is not nice to show

      // Add preferred date label
      const postFix =
        this.getPreferredDateField() === esFieldName ? " (PREFERRED)" : "";

      return leaf + origin + (isKeywordField ? " *" : "") + postFix;
    }
    return esFieldName;
  }

  //maps a LD predicate to an ES field name
  predicateToIndexField = (p) => p;

  //used to prevent graphs to blow up in case the minimum date is really low (because of incorrect data)
  getMinimumYear = () => 1600;

  getMaximumYear = () => -1;

  // only excludes these fields from the search results, NOT the resource viewer page
  getFieldsToExclude = () => null;

  getHighlightFields = () => ["*"]; //provide an array with ES field names to highlight

  /* ---------------------------------- COLLECTION-SPECIFIC STATIC TEXTS -------------------------------- */

  //returns the static text for the search snippet or the highlight overview in the quick viewer
  getMatchingTermsMsg(numHits, forSnippet) {
    if (forSnippet) {
      return numHits > 0
        ? numHits +
            " match" +
            (numHits === 1 ? "" : "es") +
            " in archival metadata"
        : " No matches in the archival metadata, matching terms found in the automatic enrichments";
    } else {
      return numHits <= 0
        ? "No matching terms found in the archival metadata, matching terms may be in the automatic annotations (visible when going to the Resource's full view)."
        : "Matching terms in archival metadata";
    }
  }

  //use the search term to find matching media fragments within the active media object
  //populate activeMediaObject.mediaFragments with an array of fragments to make it work
  findMatchingMediaFragments = (
    resource,
    searchTerm,
    activeMediaObject = null // eslint-disable-line no-unused-vars
  ) => {
    return null;
  };

  //Used to get the right page as first document... only used in NIOD for now to select the right 'first' page
  // eslint-disable-next-line no-unused-vars
  getFirstMediaObject = (resourceIgnored) => {
    return null;
  };
}
