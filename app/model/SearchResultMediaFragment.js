export default class SearchResultMediaFragment {
  //used to express an inner_hit (MotU only uses this)
  //Note: if the mapping added a mediaFragment propery, it means ES returned info to identify the exact
  //Note: so this is different from MediaObject.mediaFragments!
  //mediaObject (identified by content ID) + fragment params
  construct(assetId, url, start, end, snippet, layer) {
    this.assetId = assetId;
    this.url = url;
    this.start = start;
    this.end = end;
    this.snippet = snippet;
    this.layer = layer;
  }
}
