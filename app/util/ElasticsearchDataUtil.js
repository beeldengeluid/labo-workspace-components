const ElasticsearchDataUtil = {
  normalizeKeywordField(field) {
    return field && field.indexOf(".keyword") !== -1
      ? field.substring(0, field.indexOf(".keyword"))
      : field;
  },

  //tries to automatically detect facets based on the Search API's collection statistics
  //See CollectionConfig.jsx for more insight
  //TODO also extend this with autodection based on known schemata
  extractFacetsFromStats: function (dateFields, stringFields) {
    const facets = [];
    if (dateFields && dateFields.length > 0) {
      //2010-03-15 voor dc:date
      //DIDL 2016-01-12T14:37:36.671Z
      facets.push({
        field: dateFields[0],
        title: "Date",
        id: "date",
        operator: "AND",
        size: 10,
        type: "date_histogram",
        display: true,
      });
    }
    //look for genre, subject, coverage & contributors in the string fields
    if (stringFields && stringFields.length > 0) {
      const genres = stringFields.filter((sf) => {
        return sf.indexOf("genre") !== -1;
      });
      const subjects = stringFields.filter((sf) => {
        return sf.indexOf("subject") !== -1;
      });
      const locations = stringFields.filter((sf) => {
        return sf.indexOf("coverage") !== -1;
      });
      const contributors = stringFields.filter((sf) => {
        return sf.indexOf("contributor") !== -1;
      });
      if (genres.length > 0) {
        facets.push({
          field: genres[0],
          title: "Genre",
          id: "genre",
          type: "string",
        });
      }
      if (subjects.length > 0) {
        facets.push({
          field: subjects[0],
          title: "Subject",
          id: "subject",
          type: "string",
        });
      }
      if (locations.length > 0) {
        facets.push({
          field: locations[0],
          title: "Location",
          id: "location",
          type: "string",
        });
      }
      if (contributors.length > 0) {
        facets.push({
          field: contributors[0],
          title: "Contributor",
          id: "contributor",
          type: "string",
        });
      }
    }
    return facets.length > 0 ? facets : null;
  },
};

export default ElasticsearchDataUtil;
