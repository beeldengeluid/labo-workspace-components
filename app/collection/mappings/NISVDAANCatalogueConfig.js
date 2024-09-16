import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";

export default class NISVDAANCatalogueConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getProgramSegmentLabel = () => "Program segments:";

  getNamespace = () => "http://av.beeldengeluid.nl/";

  //the type varies for B&G
  getCollectionMediaTypes = () => [];

  //used to prevent graphs to blow up in case the minimum date is really low (because of incorrect data)
  getMinimumYear = () => 1875;
  getMaximumYear = () => -1;

  //override so the annotation layer indices are ignored
  getCollectionIndices = () => [this.getCollectionId()];

  //this means the resource viewer needs to request access to the content before it can show them
  requiresPlayoutAccess = () => true;

  getAnonymousUserRestrictions = () => ({
    prohibitThumbnails: false, // allow thumbnails in search results
    prohibitPlayout: true, // prohibit playing the content
    prohibitedLayers: ["layer__asr"], // remove the layer__asr from the exporter metadata
    prohibitTranscripts: true, // remove the transcripts from the exported metadata
  });

  hideOffAirContent = () => true;

  getPreferredDateField = () => "program.sortdate";

  //gets the fields for showing highlights in search snippets, in order of preference
  /*getPreferredHighlightFields = () => [
		'layer__asr.words',
		'summary', //aren't these also from the logtracks?
		'summaryshort', //aren't these from the logtracks?
		'title',
		'alttitle',
		'summarymuseum',
		'subjectterm',
		'name',
		'actor',
		'person',
		'corporation',
		'geographical',
		'usedfootagenpo'
	];*/

  getFieldsToExclude = () => [
    "layer__asr",
    "logTrackItems.ltSubtitles",
    "logTrackItems.ltFaceLabels",
    "logTrackItems.ltSpeakerLabels",
    "logTrackItems.ltExtractedLabels",
    "logTrackItems.ltSpeechTranscripts",
    "logTrackItems.ltAgendaPoint",
    "logTrackItems.ltOther",
    "logTrackItems.ltVoting",
    "logTrackItems.ltComposition",
    "logTrackItems.ltSubtitlesCavena",
    "logTrackItems.ltDraadboekFragment",
  ];

  //fields for ES highlighting
  getHighlightFields = () => [
    "layer__asr.words",
    "*.title",
    "logTrackItems.ltSubtitles.summary",
    "logTrackItems.ltFaceLabels.summary",
    "logTrackItems.ltSpeakerLabels.summary",
    "logTrackItems.ltExtractedLabels.summary",
    "logTrackItems.ltSpeechTranscripts.summary",
    "*.summary", //aren't these also from the logtracks?
    "*.summaryshort", //aren't these from the logtracks?
    "*.title",
    "*.alttitle",
    "*.summarymuseum",
    "*.subjectterm.label",
    "*.name.label",
    "*.actor.label",
    "*.person.label",
    "*.corporation.label",
    "*.geographical.label",
    "*.usedfootagenpo",
  ];

  getDateFields = () =>
    this.dateFields.filter((dateField) => !dateField.includes("_"));

  getFacets = () => [
    {
      field: "mediaType",
      title: "mediaType",
      id: "mediaType",
      type: "string",
    },
    {
      field: "program.publication.broadcastorg.keyword",
      title: "Broadcaster",
      id: "broadcaster",
      type: "string",
    },
    {
      field: "series.genre.label.keyword",
      title: "Genre (series)",
      id: "genre",
      type: "string",
    },
    {
      field: "program.subjectterm.label.keyword",
      title: "Keyword",
      id: "keyword",
      type: "string",
    },
  ];

  //no nested search layers as ASR no longer nested
  getNestedSearchLayers = () => [];

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Titles",
      fields: [
        "series.title",
        "season.title",
        "program.title",
        "logTrackItems.ltSceneDesc.title", //for scene descriptions
      ],
    },
    {
      id: "descriptions",
      label: "Descriptions",
      fields: [
        "program.summaryshort",
        "program.summary",
        "logTrackItems.ltSceneDesc.summary", //for scene descriptions
        //NOTE: museum descriptions in DAAN are now modelled as titles
      ],
    },
    //TODO: add back in once have worked out how we will model the subtitle logtrack items
    {
      id: "subtitles",
      label: "Keywords from Subtitles",
      fields: [
        "logTrackItems.ltSubtitles.text", //TODO: is it only Subtitles logtrackitems that have a text field?
      ],
    },
    {
      id: "subject",
      label: "Subject keywords",
      fields: [
        "program.subjectterm.label",
        "season.subjectterm.label",
        "logTrackItems.ltSceneDesc.subjectterm.label", // for scene descriptions
        "series.subjectterm.label",
      ],
    },
    {
      id: "person",
      label: "Persons - all",
      fields: [
        "program.cast.actor.label",
        "series.cast.actor.label",
        "season.cast.actor.label",
        "logTrackItems.ltSceneDesc.cast.actor.label",
        "program.crew.name.label",
        "series.crew.name.label",
        "season.crew.name.label",
        "logTrackItems.ltSceneDesc.crew.name.label",
        "program.creator.name.label",
        "series.creator.name.label",
        "season.creator.name.label",
        "logTrackItems.ltSceneDesc.creator.name.label",
        "program.performer.name.label",
        "series.performer.name.label",
        "season.performer.name.label",
        "logTrackItems.ltSceneDesc.performer.name.label",
        "program.guest.name.label",
        "series.guest.name.label",
        "season.guest.name.label",
        "logTrackItems.ltSceneDesc.guest.name.label",
        "program.person.label",
        "series.person.label",
        "season.person.label",
        "logTrackItems.ltSceneDesc.person.label",
      ],
    },
    {
      id: "production-person",
      label: "Persons - production",
      fields: [
        "program.cast.actor.label",
        "series.cast.actor.label",
        "season.cast.actor.label",
        "logTrackItems.ltSceneDesc.cast.actor.label",
        "program.crew.name.label",
        "series.crew.name.label",
        "season.crew.name.label",
        "logTrackItems.ltSceneDesc.crew.name.label",
        "program.creator.name.label",
        "series.creator.name.label",
        "season.creator.name.label",
        "logTrackItems.ltSceneDesc.creator.name.label",
        "program.performer.name.label",
        "series.performer.name.label",
        "season.performer.name.label",
        "logTrackItems.ltSceneDesc.performer.name.label",
      ],
    },
    {
      id: "guest-person",
      label: "Persons - guests",
      fields: [
        "program.guest.name.label",
        "series.guest.name.label",
        "season.guest.name.label",
        "logTrackItems.ltSceneDesc.guest.name.label",
      ],
    },
    {
      id: "discussed-person",
      label: "Persons - subject of discussion",
      fields: [
        "program.person.label",
        "series.person.label",
        "season.person.label",
        "logTrackItems.ltSceneDesc.person.label",
      ],
    },
    {
      id: "asr",
      label: "Speech transcripts (ASR)",
      enrichment: true,
      fields: ["layer__asr.words"],
    },
  ];

  //gets the item's URI in the linked data store
  getResourceUri = (resource) => {
    // return "http://data.rdlabs.beeldengeluid.nl/resource/program/" + resource["rawData"]["program"]["site_id"].replace("PGM", "");
    return (
      "http://data.beeldengeluid.nl/id/program/" +
      resource["rawData"]["program_id"]
    );
  };

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  //in case the field name cannot be found in the field descriptions
  formatIndexFieldName = (esFieldName) => {
    if (esFieldName === "layer__asr.words") {
      return "Speech transcript";
    }
    return esFieldName; //don't format, force the field_descriptions to be updated
  };

  //override to add the level to each field (which will display in the FieldSelector)
  //at the same time, exclude the level from the pretty field name
  getAllFields = () => {
    const fields = super.getAllFields();
    fields.forEach((f) => {
      const tmp = f.id.split(".");
      let metadataLayer = "program";
      if (tmp[0].indexOf("series") !== -1) {
        metadataLayer = "series";
      } else if (tmp[0].indexOf("season") !== -1) {
        metadataLayer = "season";
      }
      f.level = metadataLayer;
      f.title = this.toPrettyFieldName(f.id, false);
    });
    return fields;
  };

  usesLayeredModel = () => true;

  // Returns the first media object that matches the search term in the ASR transcript
  // If a media object is provided, only looks for matches within that media object
  findMatchingMediaFragments = (
    resource,
    searchTerm,
    activeMediaObject = null,
  ) => {
    if (!resource.transcripts) return null;

    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex", err);
    }
    if (!regex) {
      return null;
    }

    let firstMatch = null;
    for (let assetId of Object.keys(resource.transcripts)) {
      // first look for a match
      firstMatch = resource.transcripts[assetId].find((t) => {
        return (
          t.lines
            .map((l) => l.text)
            .join(" ")
            .search(regex) !== -1
        );
      });

      // stop searching if the activeMediaObject was checked
      if (activeMediaObject && activeMediaObject.assetId === assetId) {
        break;
      }
      if (firstMatch != null) {
        break;
      }
    }

    return firstMatch
      ? resource.playableContent.find(
          (mo) => mo.assetId === firstMatch.mediaObjectId,
        )
      : null;
  };
}
