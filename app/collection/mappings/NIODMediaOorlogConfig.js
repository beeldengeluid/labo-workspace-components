import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class NIODMediaOorlogConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["image"];

  //getMinimumYear = () => 1965;
  //getMaximumYear = () => 1995;

  getMetadataFieldCategories = () => [
    {
      id: "ocr",
      label: "OCR",
      fields: ["page.words"],
    },
  ];

  getPreferredDateField = () => "curatedDate";

  getFieldsToExclude = () => ["page.*"];

  getFacets = () => [
    {
      field: "folder.folderLine.keyword",
      title: "Folder",
      id: "folderline",
      type: "string",
    },
  ];

  requiresPlayoutAccess = () => true;

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  // Returns the first media object that matches the search term (by checking the OCR)
  // If a media object is provided, only looks for matches within that media object

  findMatchingMediaFragments = (
    resource,
    searchTerm,
    // eslint-disable-next-line no-unused-vars
    activeMediaObjectIgnored
  ) => {
    if (!resource.rawData.page) return null;
    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex");
    }

    const matchingPage = resource.rawData.page;

    const matchingMediaObject = resource.playableContent.find(
      (mo) => mo.assetId === resource.rawData.page.assetId
    );
    if (!matchingMediaObject) return null;

    let matchingBlocks = null;
    if (matchingPage.blocks) {
      matchingBlocks = matchingPage
        ? matchingPage.blocks.filter((block) => {
            return block.words && block.words.search(regex) !== -1;
          })
        : [];

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
    }

    return matchingMediaObject;
  };

  //Used to get the right page in playable content as first media object
  getFirstMediaObject = (resource) => {
    let matchingMediaObject = null;
    matchingMediaObject = resource.playableContent.find(
      (mo) => mo.assetId === resource.rawData.page.assetId
    );
    return matchingMediaObject;
  };
}
