/*
Check this out later: https://zhirzh.github.io/2017/01/30/browser-history-functioning-&-loopback-gotcha/
*/

export default class FlexRouter {
  static createSearchQueryUrl = (queryId) => {
    let url = FlexRouter.__getBaseUrl() + "/tool/single-search";
    if (queryId) {
      url += "?queryId=" + queryId;
    }
    return url;
  };

  static gotoSingleSearch = (queryId) => {
    let url = FlexRouter.createSearchQueryUrl(queryId);
    console.log("returned url");
    console.log(url);
    document.location.href = url;
  };

  static gotoQueryComparisonTool = () => {
    document.location.href =
      FlexRouter.__getBaseUrl() + "/tool/query-comparison";
  };

  //this is typically called from a search recipe after clicking a search result
  //FIXME expects a FORMATTED searchResult
  static popupResourceViewer = (
    recipePath,
    searchResult,
    searchTerm,
    popUpName,
    singleResource,
    onCloseCallback,
  ) => {
    // create the popup covering most of the current window, centered
    const popup = window.open(
      FlexRouter.__getResourceViewerUrl(
        recipePath,
        searchResult,
        searchTerm,
        true,
        singleResource,
      ),
      popUpName,
      "width=" +
        Math.round(window.innerWidth * 0.9) +
        ",height=" +
        Math.round(window.innerHeight * 0.9) +
        ",top=" +
        Math.round(window.screenTop + window.innerHeight * 0.05) +
        ",left=" +
        Math.round(window.screenLeft + window.innerWidth * 0.05),
    );

    // Handle close
    if (onCloseCallback) {
      // this is a fairly robust way to check if the popup has been closed
      // after closing, call the onCloseCallback function
      const pollTimer = window.setInterval(() => {
        if (popup.closed !== false) {
          // !== is required for compatibility with Opera
          window.clearInterval(pollTimer);
          onCloseCallback();
        }
      }, 200);
    }
  };

  static __getResourceViewerUrl = (
    recipePath,
    searchResult, //NOT a SearchResult.js but {resourceId: 'x', index: 'collectionx', startTime : 1241243}
    searchTerm,
    hidePageHeader = false,
    singleResource = false,
  ) => {
    if (!searchResult) return false;
    let url =
      FlexRouter.__getBaseUrl() + recipePath + "?id=" + searchResult.resourceId;

    if (searchResult && searchResult.startTime) {
      url += "&startTime=" + searchResult.startTime;
    }

    url += "&cid=" + (searchResult.collectionId || searchResult.index); //FIXME is the searchResult.index ever used?
    if (searchTerm) url += "&st=" + searchTerm;
    if (hidePageHeader) url += "&bodyClass=noHeader"; //hide the page header y/n (used for popups)
    if (singleResource) url += "&singleResource=1"; //TODO not sure if this is a duplicate param
    //check the collection config to see how the mediaFragment was added to the result object
    if (searchResult.mediaFragment) {
      if (
        Object.prototype.hasOwnProperty.call(
          searchResult.mediaFragment,
          "contentId",
        )
      )
        url += "&contentId=" + searchResult.mediaFragment.contentId;
      if (
        Object.prototype.hasOwnProperty.call(
          searchResult.mediaFragment,
          "start",
        )
      )
        url += "&s=" + searchResult.mediaFragment.start;
      if (
        Object.prototype.hasOwnProperty.call(searchResult.mediaFragment, "end")
      )
        url += "&e=" + searchResult.mediaFragment.end;
      if (Object.prototype.hasOwnProperty.call(searchResult.mediaFragment, "x"))
        url += "&x=" + searchResult.mediaFragment.x;
      if (Object.prototype.hasOwnProperty.call(searchResult.mediaFragment, "y"))
        url += "&y=" + searchResult.mediaFragment.y;
      if (Object.prototype.hasOwnProperty.call(searchResult.mediaFragment, "w"))
        url += "&w=" + searchResult.mediaFragment.w;
      if (Object.prototype.hasOwnProperty.call(searchResult.mediaFragment, "h"))
        url += "&h=" + searchResult.mediaFragment.h;
      if (
        Object.prototype.hasOwnProperty.call(
          searchResult.mediaFragment,
          "layer",
        )
      )
        url += "&l=" + searchResult.mediaFragment.layer;
    }
    return url;
  };

  static __getBaseUrl = () => {
    const temp = window.location.href;
    const arr = temp.split("/");
    return arr[0] + "//" + arr[2];
  };

  static __toUrlParamList = (params) => {
    let paramList = null;
    if (
      params &&
      typeof params === "object" &&
      Object.keys(params).length > 0
    ) {
      paramList = [];
      for (const p in params) {
        paramList.push(p + "=" + params[p]);
      }
    }
    return paramList;
  };
}
