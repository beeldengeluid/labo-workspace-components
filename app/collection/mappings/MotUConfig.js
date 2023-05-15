import CollectionConfig from "./CollectionConfig";

export default class MotUConfig extends CollectionConfig {
  //requires the output of [SEARCH_API]/api/v1/collections/show_stats?collectionId=[ID]
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["video"];

  getFragmentPath = () => "body.value";

  getFragmentTextFields = () => [
    "body.value.words",
    "body.value.tags",
    "body.value.title",
    "body.value.parent_tags",
  ];

  getImageBaseUrl = () => "http://rdbg.tuxic.nl/mindoftheuniverse";

  getFacets = () => [
    {
      field: "name",
      title: "Researchers",
    },
    {
      field: "body.value.tags_raw",
      title: "Segment tags",
      type: "nested",
    },
    {
      field: "body.value.keyMoments",
      title: "Key moments",
      type: "nested",
    },
    {
      field: "tags_raw",
      title: "Interview tags",
    },
    {
      field: "placeOfResidence",
      title: "Place of residence",
    },
    {
      field: "nationality.keyword",
      title: "Nationality",
    },
  ];

  //TODO won't work anymore with the new Search API I think... (8-feb-2021)
  // eslint-disable-next-line no-unused-vars
  getItemDetailData(result, currentDateField) {
    result = this.formatSearchResult(result);
    const formattedResult = {};

    //then add the most basic top level data
    formattedResult.resourceId = result._id;
    formattedResult.index = result._index;
    formattedResult.docType = result._type;
    formattedResult.collectionId = result.collectionId;

    formattedResult.title = result.title;
    formattedResult.description = result.description;
    formattedResult.posterURL = result.posterURL;
    formattedResult.tags = result.tags;
    formattedResult.playableContent = result.playableContent;

    if (
      result._type == "media_fragment" &&
      result.playableContent &&
      result.playableContent.length > 0
    ) {
      formattedResult.mediaFragment = {
        url: result.playableContent[0].url,
        start: result.start,
        end: result.end,
      };
    }

    formattedResult.rawData = result;

    formattedResult.mediaTypes = ["video"]; //all items have video
    return formattedResult;
  }
}
