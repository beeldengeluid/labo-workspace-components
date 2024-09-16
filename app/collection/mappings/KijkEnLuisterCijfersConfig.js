import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class KijkEnLuisterCijfersConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["image"];

  getMinimumYear = () => 1965;
  getMaximumYear = () => 1995;

  getMetadataFieldCategories = () => [
    {
      id: "ocr",
      label: "OCR",
      fields: ["pages.words"],
    },
  ];

  getPreferredDateField = () => "rapportBegindatum";

  getFieldsToExclude = () => ["pages.*"];

  getFacets = () => [
    {
      field: "rapportCategorie",
      title: "Rapport categorie",
      id: "rcategorie",
      type: "string",
    },
    {
      field: "rapportWeeknummer",
      title: "Weeknummer",
      id: "weeknummer",
      type: "string",
    },
    {
      field: "rapportEenheid",
      title: "Rapportage eenheid",
      id: "eenheid",
      type: "string",
    },
    {
      field: "pages.paginaType",
      title: "Type informatie",
      id: "typeinformatie",
      type: "string",
    },
  ];

  requiresPlayoutAccess = () => true;

  // Ordered list by preference
  /*getPreferredHighlightFields = () => [
        "rapportNaam",
        "rapportTitel",
        "pages.words",
        "pages.paginaTitel",
        "rapportCategorie",
        "rapportEenheid",
        "rapportVolgnummer",
        "rapportJaar",
        "rapportBegindatum",
        "pages.paginaBestandsnaam",
        "pages.paginaType",
        "pages.paginaDatum",
        "pages.paginaVolgnummer",
        "pages.pageNr"
    ];*/

  /*getHighlightFields = () => [
        "rapportNaam",
        "rapportTitel",
        "rapportCategorie",
        "rapportEenheid",
        "rapportVolgnummer",
        "rapportJaar",
        "rapportBegindatum",
        "pages.words",
        "pages.paginaBestandsnaam",
        "pages.paginaTitel",
        "pages.paginaType",
        "pages.paginaDatum",
        "pages.paginaVolgnummer",
        "pages.pageNr"
    ];*/

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  // Returns the first media object that matches the search term (by checking the OCR)
  // If a media object is provided, only looks for matches within that media object
  findMatchingMediaFragments = (
    resource,
    searchTerm,
    activeMediaObject = null,
  ) => {
    if (!resource.rawData.pages) return null;
    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex", err);
    }

    if (!regex) return null;

    const matchingPage = resource.rawData.pages.find((page) => {
      return (
        page.words &&
        page.words.search(regex) !== -1 &&
        (activeMediaObject
          ? page.assetId ===
            activeMediaObject.assetId.substring(
              0,
              activeMediaObject.assetId.indexOf("__"),
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
            mo.assetId.substring(0, mo.assetId.indexOf("__")) ===
            matchingBlock.assetId,
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
