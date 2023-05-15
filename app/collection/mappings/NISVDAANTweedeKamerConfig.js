import CollectionConfig from "./CollectionConfig";
import RegexUtil from "../../util/RegexUtil";
//import MediaObject from '../../model/MediaObject';
//import MediaSegment from '../../model/MediaSegment';

export default class NISVDAANTweedeKamerConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getProgramSegmentLabel = () => "Program segments:";

  getNamespace = () => "http://av.beeldengeluid.nl/";

  //the type varies for B&G
  getCollectionMediaTypes = () => [];

  getMinimumYear = () => 2012;
  getMaximumYear = () => -1;

  //override so the annotation layer indices are ignored
  getCollectionIndices = () => [this.getCollectionId()];

  //this means the resource viewer needs to request access to the content before it can show them
  requiresPlayoutAccess = () => true;

  getAnonymousUserRestrictions = () => ({
    prohibitThumbnails: false, // allow thumbnails in search results
    prohibitPlayout: true, // prohibiy playing the content
    prohibitedLayers: ["layer__asr"], // prohibit downloading the ASR
    prohibitTranscripts: true, // remove the transcripts from the exported metadata
  });

  hideOffAirContent = () => true;

  getPreferredDateField = () => "program.sortdate";

  //gets the fields for showing highlights in search snippets, in order of preference
  /*getPreferredHighlightFields = () => [
		//check that these fields are indeed part of the main object or belong to (some of) the logtracks
		'summary',
		'title',
		'alttitle',
		'summarymuseum',
		'subjectterm',
		'name',
		'actor',
		'person',
		'corporation',
		'geographical',
		'usedfootagenpo',

		'logTrackItems.ltAgendaPoint.summary',
		'logTrackItems.ltAgendaPoint.summaryShort',

		'logTrackItems.ltOrderFragment.summary',
		'logTrackItems.ltOrderFragment.summaryShort',

		'logTrackItems.ltOther.summary',
		'logTrackItems.ltOther.summaryShort',

		'logTrackItems.ltVoting.summary',
		'logTrackItems.ltVoting.summaryShort',

		'logTrackItems.ltGeneral.summary',
		'logTrackItems.ltGeneral.summaryShort'
	];*/

  //as search results there is no way to construct transcripts for agenda points etc...
  getFieldsToExclude = () => [
    //"layer__asr",
    //"logTrackItems"
    "logTrackItems.ltSubtitles",
    "logTrackItems.ltFaceLabels",
    "logTrackItems.ltSpeakerLabels",
    "logTrackItems.ltExtractedLabels",
    "logTrackItems.ltSpeechTranscripts",
    //exclude these, but include them as highlights!
    "logTrackItems.ltAgendaPoint",
    "logTrackItems.ltOrderFragment",
    "logTrackItems.ltOther",
    "logTrackItems.ltVoting",
    "logTrackItems.ltGeneral",
  ];

  //fields for ES highlighting
  /*getHighlightFields = () => [
		//"layer__asr.words",

		"logTrackItems.ltAgendaPoint.summary",
		"logTrackItems.ltAgendaPoint.summaryShort",
		"logTrackItems.ltAgendaPoint.title",

		"logTrackItems.ltOrderFragment.summary",

	    "logTrackItems.ltOther.summary",

	    "logTrackItems.ltVoting.summary",

	    "logTrackItems.ltGeneral.summary"
	];*/

  getDateFields = () =>
    this.dateFields.filter((dateField) => !dateField.includes("_"));

  getFacets = () => [
    {
      field: "logTrackItems.ltAgendaPoint.title.keyword",
      title: "Agendapunt",
      id: "agendapoint",
      type: "string",
    },
    {
      field: "logTrackItems.ltGeneral.guest.name.keyword",
      title: "Spreker",
      id: "speaker",
      type: "string",
    },
    {
      field: "logTrackItems.ltVoting.title.keyword",
      title: "Voting",
      id: "voting",
      type: "string",
    },
    {
      field: "logTrackItems.ltVoting.summary.keyword",
      title: "Voting result",
      id: "votingresult",
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
    {
      id: "agendapoints",
      label: "Tweede Kamer: Agendapoints (titles, summary)",
      fields: [
        "logTrackItems.ltAgendaPoint.title",
        "logTrackItems.ltAgendaPoint.summary",
        "logTrackItems.ltAgendaPoint.summaryshort",
        "logTrackItems.ltAgendaPoint.alttitle.name",
      ],
    },
    {
      id: "discussions",
      label: "Tweede Kamer: Discussions (summary)",
      fields: [
        "logTrackItems.ltGeneral.summary",
        "logTrackItems.ltGeneral.summaryshort",
      ],
    },
    {
      id: "orderfragments",
      label: "Tweede Kamer: Meeting orders (titles, summary)",
      fields: [
        "logTrackItems.ltOrderFragment.title",
        "logTrackItems.ltOrderFragment.summary",
        "logTrackItems.ltOrderFragment.summaryshort",
      ],
    },
    {
      id: "votings",
      label: "Tweede Kamer: Votings (titles, summary)",
      fields: [
        "logTrackItems.ltVoting.title",
        "logTrackItems.ltVoting.summary",
        "logTrackItems.ltVoting.summaryshort",
      ],
    },
    {
      id: "speakers",
      label: "Tweede Kamer: Speaker",
      fields: [
        "logTrackItems.ltVoting.guest.name",
        "logTrackItems.ltGeneral.guest.name",
        "logTrackItems.ltAgendaPoint.guest.name",
      ],
    } /*,
		{
			id : 'asr',
			label : 'Speech transcripts (ASR)',
			enrichment : true,
			fields : [
				'layer__asr.words'
			]
		}*/,
  ];

  //https://mediasuite.xlab.nl/tool/resource-viewer?id=2102009040278756031&cid=daan-catalogue-tweede-kamer&st=stemming
  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars

  formatIndexFieldName = (esFieldName) => esFieldName;

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
    activeMediaObject = null
  ) => {
    if (!resource.transcripts) return null;

    if (!resource.playableContent) return null;

    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(searchTerm);
    } catch (err) {
      console.debug("invalid regex");
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
          (mo) => mo.assetId === firstMatch.mediaObjectId
        )
      : null;
  };
}
