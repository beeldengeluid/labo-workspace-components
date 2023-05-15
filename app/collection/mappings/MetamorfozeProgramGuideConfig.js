import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class MetamorfozeProgramGuideConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["image", "text"];

  getMinimumYear = () => 1923;
  getMaximumYear = () => 1950; //62

  getCollectionIndices = () => [this.getCollectionId()];

  getFieldsToExclude = () => ["pages.*"];

  requiresPlayoutAccess = () => true;

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titels en Collectienamen",
      fields: ["collectionName", "title"],
    },
    {
      id: "ocr",
      label: "OCR",
      enrichment: true,
      fields: ["pages.words"],
    },
  ];

  getFacets = () => [
    {
      field: "collectionName.keyword",
      title: "Collectie",
      id: "title",
      type: "string",
    },
    {
      field: "title.keyword",
      title: "Titel",
      id: "title",
      type: "string",
    },
    {
      field: "publisher.keyword",
      title: "Uitgever",
      id: "publisher",
      type: "string",
    },
    {
      field: "pubYear",
      title: "Jaar",
      id: "year",
      type: "integer",
    },
  ];

  /*getPreferredHighlightFields = () => [
        "title",
        "collectionName",
        "publisher",
        "pages.words",
        "pubDate_raw",
        "pubDate",
        "pubYear",
        "pubType",
        "shelfMark",
        "volume",
        "issue",
        "pages.pageNr",
        "seqNo"
    ];*/

  /*getHighlightFields = () => [
        "issue",
        "seqNo",
        "title",
        "pubDate",
        "shelfMark",
        "collectionName",
        "volume",
        "pages.pageNr",
        "pages.words",
        "pubYear",
        "pubDate_raw",
        "publisher",
        "pubType"
    ];*/

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  // Returns the first media object that matches the search term (by checking the OCR)
  // If a media object is provided, only looks for matches within that media object
  findMatchingMediaFragments = (
    resource,
    searchTerm,
    activeMediaObject = null
  ) => {
    if (!resource.rawData.pages) return null;
    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex");
    }
    if (!regex) return null;

    const matchingPage = resource.rawData.pages.find((page) => {
      return (
        page.words &&
        page.words.search(regex) !== -1 &&
        (activeMediaObject ? page.assetId === activeMediaObject.assetId : true)
      );
    });

    const matchingBlock = matchingPage
      ? matchingPage.blocks.find((block) => {
          return (
            block.words &&
            block.words.search(regex) !== -1 &&
            (activeMediaObject
              ? block.assetId === activeMediaObject.assetId
              : true)
          );
        })
      : null;

    const matchingBlocks = matchingPage
      ? matchingPage.blocks.filter((block) => {
          return (
            block.words &&
            block.words.search(regex) !== -1 &&
            (activeMediaObject
              ? block.assetId === activeMediaObject.assetId
              : true)
          );
        })
      : null;

    const matchingMediaObject = matchingBlock
      ? resource.playableContent.find(
          (mo) => mo.assetId == matchingBlock.assetId
        )
      : null;
    if (!matchingMediaObject) return null;

    let mediaFragments = [];
    for (let i = 0; i < matchingBlocks.length; i++) {
      mediaFragments.push({
        x: matchingBlocks[i].x,
        y: matchingBlocks[i].y,
        w: matchingBlocks[i].w,
        h: matchingBlocks[i].h,
      });
    }
    matchingMediaObject.mediaFragments = mediaFragments;
    return matchingMediaObject;
  };
}
