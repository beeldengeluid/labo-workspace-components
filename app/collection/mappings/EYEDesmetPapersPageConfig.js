import CollectionConfig from "./CollectionConfig";

//vips im_vips2tiff $OUTPUT_DIR/$i $CONVERTED_OUTPUT_DIR/$i:jpeg:75,tile:256x256,pyramid
export default class EYEDesmetPapersPageConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["text"];

  getMinimumYear = () => 1815;
  getMaximumYear = () => 1990;

  getMatchingTermsMsg = (numHits, forSnippet) => {
    if (forSnippet) {
      return numHits !== 0
        ? numHits + " match(es) in archival metadata or OCR |"
        : " No matches in the archival metadata or the OCR";
    } else {
      return numHits <= 0
        ? "No matching terms found in archival metadata or in OCR"
        : "Matching terms in archival metadata or OCR";
    }
  };

  getMetadataFieldCategories = () => [
    {
      id: "ocr",
      label: "OCR",
      enrichment: true,
      fields: ["layer__ocr.text"],
    },
  ];

  getFacets = () => [
    {
      field: "folder.folderId.keyword",
      title: "Folder ID",
      id: "folder_id",
      type: "string",
    },
    {
      field: "folder.folderGroupPeriodOriginal.keyword",
      title: "Folder group period",
      id: "group_cover_period",
      type: "string",
    },
    {
      field: "folder.chapterId",
      title: "Chapter ID",
      id: "chapter_id",
      type: "string",
    },
  ];

  //getPreferredHighlightFields = () => ['layer__ocr.text'];

  //getHighlightFields = () => ['layer__ocr.text'];

  // Formats accepted are either [yyyy1,yyyy2] or yyyy1,yyyy2 (no square brackets)
  getFormattedDates = (date) => {
    if (!date) return null;
    if (date.map) {
      return date.map((it) => (typeof it === "number" ? String(it) : it));
    } else if (typeof date === "string") {
      return date.split(", "); //e.g "1948, 1956, 1960, 1977"
    }
    return null;
  };

  requiresPlayoutAccess = () => true;

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) =>
    esFieldName === "layer__ocr.text" ? "OCR transcript" : esFieldName;

  //    findMatchingMediaFragments = (resource, searchTerm, activeMediaObject=null) => {
  //    	if(!resource.rawData.layer__ocr) return null;
  //    	if(!resource.playableContent) return null;
  //
  //        let regex = null;
  //        try {
  //            regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
  //        } catch (err) {
  //            console.debug('invalid regex');
  //        }
  //
  //        if(!regex) return null;
  //
  //		const matchingBlocks = resource.rawData.layer__ocr ? resource.rawData.layer__ocr.filter(block => {
  //			return block.text && block.text.search(regex) !== -1;
  //		}) : null;
  //
  //        const matchingMediaObject = resource.playableContent[0] ? resource.playableContent[0] : null;
  //        if(!matchingMediaObject) return null;
  //
  //        let mediaFragments = []
  //        for (let i = 0; i < matchingBlocks.length; i++) {
  //            mediaFragments.push({
  //                'x' : matchingBlocks[i].coords.l,
  //                'y' : matchingBlocks[i].coords.t,
  //                'w' : matchingBlocks[i].coords.r - matchingBlocks[i].coords.l,
  //                'h' : matchingBlocks[i].coords.b - matchingBlocks[i].coords.t
  //            });
  //        }
  //        matchingMediaObject.mediaFragments = mediaFragments
  //        return matchingMediaObject;
  //    };
}
