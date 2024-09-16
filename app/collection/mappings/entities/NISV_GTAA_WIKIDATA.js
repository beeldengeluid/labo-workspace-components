export default class NISV_GTAA_WIKIDATA {
  //NOTE: currently only used for PERSON data!

  static WIKIDATA_NS = "http://www.wikidata.org/prop/direct/";
  static RDF_NS = "http://www.w3.org/2000/01/rdf-schema#";
  static SKOS_NS = "http://www.w3.org/2004/02/skos/core#";
  static SCHEMA_NS = "http://schema.org/";

  static SOURCE_LABELS = {
    wikidata: "Wikidata",
    gtaa: "the GTAA",
    other: "an external source",
  };

  //specify the relevant properties. Per property:
  //a list of the URIs of relevant Linked Data properties
  //(these are listed in order of priority, the preferred property first)
  //the label for the property
  //showAll indicating whether to show all th values or just the first
  static ENTITY_MAPPING = {
    person: [
      // persons only for the moment
      {
        uris: [
          "http://www.w3.org/2004/02/skos/core#prefLabel",
          "http://www.w3.org/2000/01/rdf-schema#label",
          "http://www.w3.org/2004/02/skos/core#hiddenLabel",
          "http://www.w3.org/2004/02/skos/core#altLabel",
        ],
        label: "Name",
        showAll: true,
      },
      {
        uris: [
          "http://www.w3.org/2004/02/skos/core#hiddenLabel",
          "http://www.w3.org/2004/02/skos/core#altLabel",
        ],
        label: "OtherLabels",
        showAll: true,
      },
      {
        uris: ["http://www.wikidata.org/prop/direct/P18"],
        label: "ImageUrl",
        showAll: true,
      },
      { uris: ["identifier"], label: "Source", showAll: true }, //special case for showing identifiers
    ],
  };

  static getEntityMapping = (entityType) =>
    NISV_GTAA_WIKIDATA.ENTITY_MAPPING[entityType];

  //TODO merge the parseEntityDetails function?
  //formats the results retrieved from the entityType.fetchEntityDetails() call (running a grlc query)
  static formatPersonDetails = (data, queryParams) => {
    console.log("person details");

    if (data["error"]) {
      return {
        error: data["error"],
        gtaaId: queryParams["gtaa"],
      };
    }
    //check if the data contains all expected fields
    if (
      !(
        data["result"] &&
        data["result"]["results"] &&
        data["result"]["results"]["bindings"]
      )
    ) {
      return {
        error: "Server returned no person data",
        gtaaId: queryParams["gtaa"],
      };
    }

    const results = {
      //include the GTAA identifier from the query params
      identifier: [
        { value: queryParams["gtaa"], valueLabel: this.SOURCE_LABELS["gtaa"] },
      ],
    };

    data["result"]["results"]["bindings"].forEach((result) => {
      const formattedResult = {};
      const propertyUri = result["p"]["value"];
      formattedResult["value"] = result["o"]["value"];

      if (result["s"]) {
        //always add in the identifiers to show sources
        const newValue =
          results["identifier"].findIndex(
            (id) => id["value"] === result["s"]["value"],
          ) === -1;
        if (newValue) {
          results["identifier"].push({
            value: result["s"]["value"],
            valueLabel: result["s"]["value"].includes("wikidata")
              ? this.SOURCE_LABELS["wikidata"]
              : this.SOURCE_LABELS["other"],
          });
        }
      }
      if (result["l"]) {
        formattedResult["valueLabel"] = result["l"]["value"];
      }

      if (propertyUri in results) {
        results[propertyUri].push(formattedResult);
      } else {
        results[propertyUri] = [formattedResult];
      }
    });

    return NISV_GTAA_WIKIDATA.__applyPersonMapping(results);
  };

  //formats the data for the QuickEntityViewer using this model: {value : 'http://', valueLabel : 'string'}
  //TODO create a class for the LD properties to make the flow of data easier to follow
  static __applyPersonMapping = (data) => {
    const formattedPersonData = {};

    //fetch the property mapping for the entity type
    const entityProps = NISV_GTAA_WIKIDATA.getEntityMapping("person");

    //loop through all the mapped properties defined in the mapping
    for (var i = 0; i < entityProps.length; i++) {
      const values = [];

      //loop through the uris associated with the property
      for (let j = 0; j < entityProps[i].uris.length; j++) {
        //if the uri is in the data
        if (data[entityProps[i].uris[j]]) {
          for (let k = 0; k < data[entityProps[i].uris[j]].length; k++) {
            //if there is a label available, use that and the value
            if (data[entityProps[i].uris[j]][k].valueLabel) {
              if (
                !values.includes(data[entityProps[i].uris[j]][k].valueLabel)
              ) {
                values.push({
                  value: data[entityProps[i].uris[j]][k].value,
                  valueLabel: data[entityProps[i].uris[j]][k].valueLabel,
                });
              }
            } else {
              //otherwise use just the value
              values.push({ value: data[entityProps[i].uris[j]][k].value });
            }

            //if only want one value, then break
            if (!entityProps[i].showAll) break;
          }
        }
      }
      //add the values to the formatted data under the label of the property
      if (values.length > 0) {
        formattedPersonData[entityProps[i].label] = values;
      }
    }

    //upgrade wiki commons image urls to https://
    if (Object.prototype.hasOwnProperty.call(formattedPersonData, "ImageUrl")) {
      let ImageUrlValues = formattedPersonData["ImageUrl"].map((data) => ({
        value: data["value"]
          ? data["value"].replace("http://", "https://")
          : data["value"],
        valueLabel: data["valueLabe"],
      }));
      formattedPersonData["ImageUrl"] = ImageUrlValues;
    }

    return formattedPersonData;
  };

  //TODO make sure to map this to a well defined Entity class/object
  //maps the retrieved resource entities to a useful object for the MetadataColumn (which displays the entities)
  static formatPersonsInResource = (data, queryParams) => {
    if (data["error"]) {
      return {
        error: data["error"],
        resourceId: queryParams["resource"],
      };
    }
    //check if the data contains all expected fields
    if (
      !(
        data["result"] &&
        data["result"]["results"] &&
        data["result"]["results"]["bindings"]
      )
    ) {
      return {
        error: "Server returned no entity data",
        resourceId: queryParams["resource"],
      };
    }

    const roleReplacements = {
      "an entity in a role": "subject of discussion",
      "has ": "",
    }; //used to be in collectionConfig
    const results = {};

    data["result"]["results"]["bindings"].forEach((result) => {
      const entity = {
        name: result["entityName"]["value"],
        roles: [],
      };
      const entityUri = result["entity"]["value"];

      let role = result["specificRole"]
        ? result["specificRole"]["value"]
        : null;
      if (
        role == null &&
        (!result["roleLabel"]["xml:lang"] ||
          result["roleLabel"]["xml:lang"] == "en")
      ) {
        role = result["roleLabel"]["value"];
        for (const [key, value] of Object.entries(roleReplacements)) {
          role = role.replace(key, value);
        }
      }

      if (entityUri in results) {
        if (role && !results[entityUri]["roles"].includes(role)) {
          results[entityUri]["roles"].push(role);
        }
      } else {
        if (role) {
          entity["roles"] = [role];
        }
        results[entityUri] = entity;
      }
    });

    return results;
  };
}
