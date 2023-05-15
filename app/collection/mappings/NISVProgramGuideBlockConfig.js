import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class NISVProgramGuideBlockConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getNamespace = () => "omroepgidsen.beeldengeluid.nl/";

  getCollectionMediaTypes = () => ["image", "text"];

  getMinimumYear = () => 1950;
  getMaximumYear = () => 2015;

  //we want to search based on this granularity
  getFragmentPath = () => "pages.blocks";

  //this is the text field you can search on the line level
  getFragmentTextFields = () => ["pages.blocks.words"];

  getFieldsToExclude = () => null;

  requiresPlayoutAccess = () => true;

  getFacets = () => [
    {
      field: "broadcaster",
      title: "Omroep",
      id: "broadcaster",
      type: "string",
    },
    {
      field: "year",
      title: "Jaar",
      id: "year",
      type: "integer",
    },
    {
      field: "date",
      title: "Datum",
      id: "date",
      type: "date_histogram",
    },
  ];

  /*getPreferredHighlightFields = () => [
        "pages.blocks.words",
        "title",
        "broadcaster",
        "date",
        "year",
        "week",
        "pages.pageNumber",
        "pages.imageUrl"
    ];*/

  /*getHighlightFields = () => [
        "date",
        "title",
        "broadcaster",
        "week",
        "year",
        "pages.pageNumber",
        "pages.imageUrl",
        "pages.blocks.words"
    ];*/

  //TODO if available add the poster URL:
  //http://jaws.beeldengeluid.nl/fastcgi-bin/iipsrv.fcgi?IIIF=omroepgidsen/1971/EO/EO1971-02_008.tif/1036,1366,693,1366/full/0/default.jpg
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
        page.blocks &&
        page.blocks.find((block) => {
          return block.words && block.words.search(regex) !== -1;
        }) &&
        (activeMediaObject
          ? page.pageNumber ==
            activeMediaObject.assetId.substring(
              activeMediaObject.assetId.lastIndexOf("/") + 1
            )
          : true)
      );
    });

    const matchingBlock = matchingPage
      ? matchingPage.blocks.find((block) => {
          return block.words && block.words.search(regex) !== -1;
        })
      : null;

    const matchingBlocks = matchingPage
      ? matchingPage.blocks.filter((block) => {
          return block.words && block.words.search(regex) !== -1;
        })
      : null;

    const matchingMediaObject = matchingBlock
      ? resource.playableContent.find(
          (mo) =>
            mo.assetId.substring(mo.assetId.lastIndexOf("/") + 1) ==
            matchingPage.pageNumber
        )
      : null;
    if (!matchingMediaObject) return null;

    let mediaFragments = [];
    for (let i = 0; i < matchingBlocks.length; i++) {
      const temp = matchingBlocks[i].imageUrl.split("/");
      const coords = temp[temp.length - 4].split(",");
      mediaFragments.push({
        x: coords[0],
        y: coords[1],
        w: coords[2],
        h: coords[3],
      });
    }
    matchingMediaObject.mediaFragments = mediaFragments;
    return matchingMediaObject;
  };
}
