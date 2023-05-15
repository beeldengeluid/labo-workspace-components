import CollectionConfig from "./CollectionConfig";

export default class SoundbitesConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getMinimumYear = () => 1911;
  getMaximumYear = () => 2003;

  getFacets = () => [
    {
      field:
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Topic.#text.keyword",
      title: "Topic",
      id: "topic",
      type: "string",
    },
    {
      field:
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Country.cmd:Code.keyword",
      title: "Country",
      id: "country",
      type: "string",
    },
    {
      field:
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Province.keyword",
      title: "Province",
      id: "province",
      type: "string",
    },
    {
      field:
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Municipality.keyword",
      title: "Municipality",
      id: "municipality",
      type: "string",
    },
  ];

  getMetadataFieldCategories = () => [
    {
      id: "titles",
      label: "Title",
      fields: [
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Name",
      ],
    },
    {
      id: "topics",
      label: "Topic keywords",
      fields: [
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Topic",
      ],
    },
    {
      id: "locations",
      label: "Locations",
      fields: [
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:City",
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Province",
        "cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Country.cmd:Code",
      ],
    },
  ];

  /*getPreferredHighlightFields = () => [
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Topic.#text',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:City',
		'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Province',
		'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Country.cmd:Code',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Name',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Municipality',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:MunicipalityCode',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:ProvinceCode',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:KloekeGeoreference',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Continent.cmd:Code',
        'cmd:CMD.cmd:Header.cmd:MdCreationDate',
        'cmd:CMD.cmd:Header.cmd:MdCreator',
        'cmd:CMD.cmd:Header.cmd:MdcollectionDisplayName',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:CreationYear',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:SubjectLanguages.cmd:SubjectLanguage.cmdLanguage.cmdLanguageName',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Modality.cmd:Modality',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:SubGenre',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:CommunicationContext.cmd:PlanningType',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Genre',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Task',
    ];*/

  /*getHighlightFields = () => [
    	'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Topic.#text',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:City',
		'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Province',
		'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Country.cmd:Code',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Name',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Municipality',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:MunicipalityCode',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:ProvinceCode',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:KloekeGeoreference',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:GeoLocation.cmd:Continent.cmd:Code',
        'cmd:CMD.cmd:Header.cmd:MdCreationDate',
        'cmd:CMD.cmd:Header.cmd:MdCreator',
        'cmd:CMD.cmd:Header.cmd:MdcollectionDisplayName',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:CreationYear',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:SubjectLanguages.cmd:SubjectLanguage.cmdLanguage.cmdLanguageName',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Modality.cmd:Modality',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:SubGenre',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:CommunicationContext.cmd:PlanningType',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Genre',
        'cmd:CMD.cmd:Components.cmd:Soundbites-recording.cmd:SESSION.cmd:Content.cmd:Task',
    ];*/

  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars
}
