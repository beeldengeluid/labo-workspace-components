import LocalStorageHandler from "./LocalStorageHandler";
import SearchAPI from "../api/SearchAPI";

const PaginationUtil = {
  getSearchResultRenderInfo(currentItem) {
    const storedResults = LocalStorageHandler.getJSONFromLocalStorage(
      "stored-search-results"
    );
    if (!storedResults) {
      return PaginationUtil.__toRenderInfo(true, true, -1, null);
    }

    const index = PaginationUtil.__getCurrentIndex(
      storedResults.results,
      currentItem
    );

    const isFirstHit = storedResults.query.offset === 0 && index === 0;
    const isLastHit =
      storedResults.query.offset + index >= storedResults.totalHits - 1;

    return PaginationUtil.__toRenderInfo(
      isFirstHit,
      isLastHit,
      index,
      storedResults.results
    );
  },

  getSelectionsRenderInfo(currentItem) {
    const selectedItems =
      LocalStorageHandler.getJSONFromLocalStorage("stored-selections");
    if (!selectedItems) {
      return PaginationUtil.__toRenderInfo(true, true, -1, null);
    }
    const index = PaginationUtil.__getCurrentIndex(selectedItems, currentItem);

    const isFirstHit = index === 0;
    const isLastHit = index === selectedItems.length - 1;

    return PaginationUtil.__toRenderInfo(
      isFirstHit,
      isLastHit,
      index,
      selectedItems
    );
  },

  __toRenderInfo(isFirstHit, isLastHit, itemIndex, itemList) {
    return {
      isFirstHit: isFirstHit,
      isLastHit: isLastHit,
      nextResource: !isLastHit
        ? PaginationUtil.__getNextItem(itemIndex, itemList, true)
        : null,
      prevResource: !isFirstHit
        ? PaginationUtil.__getNextItem(itemIndex, itemList, false)
        : null,
    };
  },

  //used for the paging buttons for the main result list in the SingleSearchRecipe. Also called to load a new page when moving beyond the currently stored-search-results
  loadSearchResultPage(
    searchResults,
    collectionConfig,
    pageNr,
    onPagedFunc,
    forward = true
  ) {
    //instance of SearchResults
    searchResults.query.offset = Math.max(
      0,
      (pageNr - 1) * searchResults.query.size
    );
    SearchAPI.search(
      searchResults.query,
      collectionConfig,
      (resultsObj) =>
        PaginationUtil.__onPaged(
          onPagedFunc,
          forward
            ? resultsObj.results[0]
            : resultsObj.results[resultsObj.results.length - 1], //move to the first or last result of the newly loaded page
          resultsObj
        ), //instance of SearchResults
      true //store the new page in stored-search-results
    );
  },

  loadSelectionPage() {}, //implement this later when we want to page through the selections as well

  //used for paging results in the QuickViewer & the ItemDetails
  pageSearchResults(
    currentItem,
    collectionConfig,
    forward = true,
    onPagedFunc = null,
    onLoadingFunc = null
  ) {
    const storedResults = LocalStorageHandler.getJSONFromLocalStorage(
      "stored-search-results"
    );
    const index = PaginationUtil.__getCurrentIndex(
      storedResults.results,
      currentItem
    );
    if (
      PaginationUtil.__pageLoadNeeded(index, storedResults.results, forward)
    ) {
      //is this the last item on the page?
      if (onLoadingFunc) {
        onLoadingFunc(); //FIXME maybe do this differently later
      }
      //if so load a new page
      PaginationUtil.loadSearchResultPage(
        storedResults,
        collectionConfig,
        PaginationUtil.__getNextPageNr(storedResults.currentPage, forward),
        onPagedFunc,
        forward
      );
    } else {
      PaginationUtil.__onPaged(
        onPagedFunc,
        PaginationUtil.__getNextItem(index, storedResults.results, forward)
      );
    }
  },

  pageSelections(currentItem, forward = true, onPagedFunc = null) {
    const itemList =
      LocalStorageHandler.getJSONFromLocalStorage("stored-selections");
    const index = PaginationUtil.__getCurrentIndex(itemList, currentItem);
    if (!PaginationUtil.__pageLoadNeeded(index, itemList, forward)) {
      //only page when the edges haven't been reached yet
      PaginationUtil.__onPaged(
        onPagedFunc,
        PaginationUtil.__getNextItem(index, itemList, forward)
      );
    }
  },

  __pageLoadNeeded(currentIndex, itemList, forward = true) {
    if (forward) {
      return currentIndex >= itemList.length - 1;
    }
    return currentIndex <= 0;
  },

  __getCurrentIndex(itemList, currentItem) {
    return itemList.findIndex(
      (item) => item.resourceId === currentItem.resourceId
    );
  },

  __getNextPageNr(currentPage, forward = true) {
    return forward ? currentPage + 1 : Math.max(0, currentPage - 1); //don't go below page zero
  },

  __getNextItem(currentIndex, itemList, forward = true) {
    return forward
      ? itemList[currentIndex + 1]
      : itemList[Math.max(0, currentIndex - 1)]; //don't go below page zero
  },

  //each of the components using this util, should receive this information back when using pageSearchResults
  __onPaged(onPagedFunc, activeResource, newSearchResults = null) {
    onPagedFunc(activeResource, newSearchResults);
  },
};

export default PaginationUtil;
