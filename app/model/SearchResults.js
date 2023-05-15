import Query from "./Query";
import Resource from "./Resource";

export default class SearchResults {
  constructor(
    searchId,
    pagingOutOfBounds,
    query,
    currentPage,
    collectionConfig,
    results,
    aggregations,
    totalHits,
    totalUniqueHits
  ) {
    this.searchId = searchId; // generated for every new search, so the UI knows it's different (FIXME probably no longer needed)
    this.pagingOutOfBounds = pagingOutOfBounds; // used to see if the search API returned an out of bounds message (FIXME make nicer)

    this.query = query; // instance of Query
    this.currentPage = currentPage; // current page within the returned search results (FIXME could probably be removed as well)
    this.collectionConfig = collectionConfig;
    this.results = results;
    this.aggregations = aggregations;
    this.totalHits = totalHits;
    this.totalUniqueHits = totalUniqueHits;

    //const searchTerm = query ? query.term : null;
    //const searchRegex = query ? query.searchRegex : null;
    //const dateField = query && query.dateRange ? query.dateRange.field : null;
  }

  static construct = (
    searchId,
    pagingOutOfBounds,
    searchAPIData,
    collectionConfig
  ) => {
    const query = Query.construct(searchAPIData.params, collectionConfig);
    const currentPage = searchAPIData.results
      ? Math.ceil(query.offset / query.size) + 1
      : -1;
    const searchResults = searchAPIData.results
      ? searchAPIData.results.map((result) =>
          Resource.construct(result, query, collectionConfig)
        )
      : [];

    return new SearchResults(
      searchId,
      pagingOutOfBounds,
      query,
      currentPage,
      collectionConfig,
      searchResults,
      searchAPIData.aggregations, //TODO make a model for this as well
      searchAPIData.totalHits,
      searchAPIData.totalUniqueHits
    );
  };

  //used to store in 'currentSearchResults'
  toLocalStorageObject = () => {
    return {
      results: this.results,
      query: this.query,
      currentPage: this.currentPage,
      totalHits: this.totalHits,
    };
  };
}
