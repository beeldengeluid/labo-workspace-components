import CollectionConfig from "./CollectionConfig";

export default class RVDContractsConfig extends CollectionConfig {
  constructor(clientId, user, collectionId, collectionMetadata) {
    super(clientId, user, collectionId, collectionMetadata);
  }

  getCollectionMediaTypes = () => ["image", "text"];

  getMinimumYear = () => 1944;
  getMaximumYear = () => 1995;

  getMetadataFieldCategories = () => [
    {
      id: "ocr_text",
      label: "OCR tekst",
      fields: ["contracts.pages.blocks.lines.line"],
    },
  ];

  requiresPlayoutAccess = () => true;

  getFacets = () => [
    {
      field: "title.keyword",
      title: "Filmtitel",
      id: "title",
      type: "string",
    },
    {
      field: "producer.keyword",
      title: "Producent/maker",
      id: "producer",
      type: "string",
    },
    {
      field: "personX.keyword",
      title: "Donateur",
      id: "donor",
      type: "string",
    },
    {
      field: "organizationY.keyword",
      title: "Organisatie",
      id: "organization",
      type: "string",
    },
  ];

  /*getPreferredHighlightFields = () =>[
        "title",
        "contractInfo",
        "dossiers.dossierDescription",
        "contracts.title",
        "contracts.pages.blocks.lines.line",
        "personX",
        "organizationY",
        "producer",
        "rightsOwner",
        "technicalData",
        "comments",
        "date",
        "availInfo",
        "rowId",
        "rightsOwnerOther",
        "archiveNumber",
        "contractualRestriction",
        "dateRaw",
        "archivalLocation",
        "contracts.contractType",
        "contracts.boxNumber",
        "contracts.boxType",
        "contracts.collectionId",
        "dossiers.important",
        "dossiers.access2006",
        "dossiers.invent2006",
        "dossiers.archiveCode",
        "dossiers.yearDossierRaw",
        "dossiers.yearDossier"
    ];*/

  /*getHighlightFields = () => [
        "date",
        "comments",
        "dossiers.important",
        "dossiers.access2006",
        "dossiers.invent2006",
        "dossiers.archiveCode",
        "dossiers.yearDossierRaw",
        "dossiers.yearDossier",
        "dossiers.dossierDescription",
        "contractInfo",
        "rightsOwner",
        "technicalData",
        "availInfo",
        "personX",
        "title",
        "rowId",
        "producer",
        "rightsOwnerOther",
        "archiveNumber",
        "contractualRestriction",
        "dateRaw",
        "archivalLocation",
        "organizationY",
        "contracts.contractType",
        "contracts.boxNumber",
        "contracts.title",
        "contracts.boxType",
        "contracts.collectionId",
        "contracts.pages.blocks.lines.line"
    ];*/

  //TODO if available add the poster URL:
  //http://hugodrax.beeldengeluid.nl:84/fcgi-bin/iipsrv.fcgi?IIIF=BG0261104_0081.tif/108,1876,514,29/full/0/default.jpg
  getItemDetailData = (result, currentDateField) => result; // eslint-disable-line no-unused-vars
}
