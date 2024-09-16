import PropTypes from "prop-types";

import IDUtil from "../util/IDUtil";
import TimeUtil from "../util/TimeUtil";
import RegexUtil from "../util/RegexUtil";

export default class Query {
  constructor(
    id,
    searchId,
    term,
    collectionId,
    searchLayers,
    nestedSearchLayers,
    dateRange,
    fieldCategory,
    selectedFacets,
    desiredFacets,
    entities,
    sort,
    offset,
    size,
    exclude,
    fragmentPath = null,
    fragmentFields = null,
    includeFragmentChildren = false,
    includeMediaObjects = null,
    innerHitsOffset = 0,
    innerHitsSize = 5,
    highlightFields = null,
    storeAfterExecution = true,
  ) {
    this.id = id;
    this.searchId = searchId;
    this.term = term;
    this.collectionId = collectionId;
    this.searchLayers = searchLayers; // deprecated, used for multi index search
    this.nestedSearchLayers = nestedSearchLayers; // used for searching within nested documents
    this.dateRange = dateRange;
    this.fieldCategory = fieldCategory;
    this.selectedFacets = selectedFacets;
    this.desiredFacets = desiredFacets;
    this.entities = entities;
    this.sort = sort;
    this.offset = offset;
    this.size = size;
    this.exclude = exclude;
    //generated based on the search term
    this.searchRegex = RegexUtil.generateRegexForSearchTerm(term); // store the search term regexp here for convenience/performance

    //properties for fragment search (based on nested documents)
    this.fragmentPath = fragmentPath;
    this.fragmentFields = fragmentFields;
    this.includeFragmentChildren = includeFragmentChildren;
    this.includeMediaObjects = includeMediaObjects;
    this.innerHitsOffset = innerHitsOffset;
    this.innerHitsSize = innerHitsSize;

    this.highlightFields = highlightFields;

    this.storeAfterExecution = storeAfterExecution; //caches the results in localstorage (see SearchAPI)
  }

  //when a collectionConfig is provided, it means that defaults from this should be used to populate the query object
  static construct(obj, collectionConfig = null, storeAfterExecution = true) {
    obj = obj || {};
    const term = obj.term || "";
    return new Query(
      obj.id || IDUtil.guid(), // used as a GUID
      obj.searchId || null, // used to differentiate different executions of this query
      term, // the search term entered by the user
      (collectionConfig
        ? collectionConfig.getSearchIndex()
        : obj.collectionId) || null, // the collection being queried
      Query.determineSearchLayers(obj, collectionConfig), // what layers to include
      obj.nestedSearchLayers ||
        (collectionConfig ? collectionConfig.getNestedSearchLayers() : null), // what nested search layers to include
      obj.dateRange || null, // the selected date field and range (start/end dates)
      obj.fieldCategory || null, // for field-specific search; can be defined by overriding CollectionConfig.getMetadataFieldCategories()
      obj.selectedFacets || {}, // filters selected by the user (by selecting certain values from the desiredFacets)
      obj.desiredFacets || Query.getInitialDesiredFacets(obj, collectionConfig), //which aggregations should be included next to the search results
      obj.entities || [],
      obj.sort && obj.sort.field
        ? obj.sort
        : { field: "_score", order: "desc" }, // direction & field to sort on
      obj.offset || 0, // for paging
      obj.size || 20, // for paging
      obj.exclude ||
        (collectionConfig ? collectionConfig.getFieldsToExclude() : null), // remove certain fields from the returned data

      //for fragment search only
      obj.fragmentPath ||
        (collectionConfig ? collectionConfig.getFragmentPath() : null), // path to the desired nested document, e.g. document.page.paragraph
      obj.fragmentFields ||
        (collectionConfig ? collectionConfig.getFragmentTextFields() : null), // which fields of the indicated nested document to retrieve

      typeof obj.includeFragmentChildren === "boolean"
        ? obj.includeFragmentChildren
        : collectionConfig && collectionConfig.includeFragmentChildren(), // return sub fragments y/n
      typeof obj.includeMediaObjects === "boolean"
        ? obj.includeMediaObjects
        : collectionConfig && collectionConfig.includeMediaObjects(term), // decide whether to search/retrieve the document level as well

      //paging within inner hits is not really supported/reflected by the UI (yet)
      obj.innerHitsOffset || 0,
      obj.innerHitsSize || 5,

      //new highlight feature TODO finish & test
      obj.highlightFields ||
        (collectionConfig ? collectionConfig.getHighlightFields() : null),

      storeAfterExecution, //whether to store the query results right after execution (in local storage)
    );
  }

  static determineSearchLayers(query, config) {
    let searchLayers = null;
    let foundLayer = false;
    if (config && config.getCollectionIndices()) {
      searchLayers = {};
      config.getCollectionIndices().forEach((layer) => {
        if (query && query.searchLayers) {
          if (query.searchLayers[layer] !== undefined) {
            searchLayers[layer] = query.searchLayers[layer];
            foundLayer = true;
          } else {
            searchLayers[layer] = false;
          }
        } else {
          //include all default layers
          searchLayers[layer] = true;
          foundLayer = true;
        }
      });
    }

    //if for some shitty reason the search layer (entered in the URL) does not match the collection ID
    //just set it manually (maybe this is being too nice)
    if (!foundLayer) {
      searchLayers = {};
      searchLayers[config ? config.getCollectionId() : query.collectionId] =
        true;
    }
    return searchLayers;
  }

  static getInitialDesiredFacets(query, config) {
    const df = (config ? config.getFacets() : null) || [];
    if (query.dateRange && query.dateRange.field) {
      df.push({
        field: query.dateRange.field,
        title: config.toPrettyFieldName(query.dateRange.field),
        id: query.dateRange.field,
        type: "date_histogram",
      });
    }
    return df;
  }

  toHumanReadableString() {
    const strList = [];
    if (this.term) {
      strList.push("Search term: " + this.term);
    } else {
      strList.push("No search term");
    }
    if (this.selectedFacets && Object.keys(this.selectedFacets).length > 0) {
      strList.push("# filters: " + Object.keys(this.selectedFacets).length);
    }
    if (this.entities && Object.keys(this.entities).length > 0) {
      strList.push("# entities: " + Object.keys(this.entities).length);
    }
    return strList.join("; ");
  }

  /* --------------------------------- FOR COPYING A QUERY TO THE CLIPBOARD ---------------------------------- */

  queryDetailsToClipboard(queryName) {
    const queryDetailsHeader = "Query details\r\r";
    const namePart = "Name: " + queryName + "\r";
    const dateFieldName =
      this.dateRange && this.dateRange.field
        ? " Name: " + this.dateRange.field + "\n"
        : "";

    const startDate =
      this.dateRange && this.dateRange.start
        ? " Start: " +
          TimeUtil.UNIXTimeToPrettyDate(this.dateRange.start) +
          "\r"
        : "";

    const endDate =
      this.dateRange && this.dateRange.end
        ? " End: " + TimeUtil.UNIXTimeToPrettyDate(this.dateRange.end) + "\r"
        : "";
    const date =
      dateFieldName || startDate || endDate
        ? "Date Field: \r" + dateFieldName + startDate + endDate + "\r"
        : "";
    const searchTerm = this.term ? "Search Term: " + this.term + "\r" : "";
    const selectedFacets = this.selectedFacets
      ? this.__getSelectedFacetsToClipboard()
      : "";
    const selectedEntities = this.entities
      ? this.__getSelectedEntitiesToClipboard()
      : "";
    const fieldCategory =
      this.fieldCategory && this.fieldCategory.length > 0
        ? this.__getFieldsCategoryToClipboard()
        : "";
    return (
      queryDetailsHeader +
      namePart +
      searchTerm +
      date +
      fieldCategory +
      selectedFacets +
      selectedEntities
    );
  }

  __getSelectedFacetsToClipboard() {
    if (this.selectedFacets && Object.keys(this.selectedFacets).length > 0) {
      let text = "Selected facets\r";
      const keys = Object.keys(this.selectedFacets);
      keys.forEach((k) => {
        text += "Facet name: " + k + " \r";
        this.selectedFacets[k].map((facet) => {
          text += " " + facet + "\r";
        });
      });
      text += "\r";
      return text;
    }
    return "";
  }

  __getFieldsCategoryToClipboard() {
    if (this.fieldCategory) {
      let text = "Selected field categories\r";
      this.fieldCategory.forEach((item) => (text += " " + item.label + "\r"));
      text += "\r";
      return text;
    }
    return "";
  }

  __getSelectedEntitiesToClipboard() {
    if (this.entities && this.entities.length > 0) {
      let text = "Selected entities:\r";
      this.entities.forEach((entity) => {
        text += entity.label + " (" + entity.type + ")" + " \r";
      });
      text += "\r";
      return text;
    }
    return "";
  }

  static getPropTypes(isRequired = true) {
    const queryShape = PropTypes.shape({
      id: PropTypes.string,
      searchId: PropTypes.string,
      term: PropTypes.string,
      collectionId: PropTypes.string,
      searchLayers: PropTypes.object,
      nestedSearchLayers: PropTypes.arrayOf(PropTypes.object),
      dateRange: PropTypes.object,
      fieldCategory: PropTypes.arrayOf(PropTypes.object),
      selectedFacets: PropTypes.object,
      desiredFacets: PropTypes.arrayOf(PropTypes.object),
      entities: PropTypes.arrayOf(PropTypes.object),
      sort: PropTypes.object,
      offset: PropTypes.number,
      size: PropTypes.number,
      exclude: PropTypes.arrayOf(PropTypes.string),
      searchRegex: PropTypes.any,
      fragmentPath: PropTypes.string,
      fragmentFields: PropTypes.array,
      includeFragmentChildren: PropTypes.bool,
      includeMediaObjects: PropTypes.bool,
      innerHitsOffset: PropTypes.number,
      innerHitsSize: PropTypes.number,
      highlightFields: PropTypes.arrayOf(PropTypes.string),
    });
    return isRequired ? queryShape.isRequired : queryShape;
  }
}
