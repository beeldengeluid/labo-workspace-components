import React from "react";
import TimeUtil from "../util/TimeUtil";

export default class MessageHelper {
  static renderQueryForTooltip = (query, collectionConfig) => {
    return (
      <div>
        {MessageHelper.renderQuery(query, collectionConfig)}
        <div className="bg__copyToClipboardMSN">On click copy to clipboard</div>
      </div>
    );
  };

  /* -------------------------------- PARTIAL RENDERING FUNCTIONS --------------------------- */

  static renderQuery = (query, collectionConfig) => {
    return (
      <div>
        <div className="bg_queryDetails-wrapper">
          <strong>Search Term:</strong> {query.term}
        </div>
        {MessageHelper.__renderDateRange(query.dateRange, collectionConfig)}
        {MessageHelper.__renderSelectedFacets(
          MessageHelper.__getFormattedSelectedFacets(query),
        )}
        {MessageHelper.__renderFieldsCategory(query.fieldCategory)}
        {MessageHelper.__renderEntities(query.entities)}
      </div>
    );
  };

  //used the desired facets to look up the pretty field name. This is not nice, but for now a good solution until the
  //object model is properly finished
  static __getFormattedSelectedFacets = (query) => {
    const cleanedObj = {};
    Object.keys(query.desiredFacets).forEach((df) => {
      const selFacets =
        df && query.selectedFacets[query.desiredFacets[df].field]
          ? query.selectedFacets[query.desiredFacets[df].field]
          : null;
      if (selFacets) {
        cleanedObj[`${query.desiredFacets[df].title}`] = selFacets;
      }
    });
    return cleanedObj;
  };

  static __renderDateRange = (dateRange, collectionConfig) => {
    if (dateRange && collectionConfig) {
      return (
        <div className="bg_queryDetails-wrapper">
          <strong>Date Field: </strong>
          <ul>
            <li>Name: {collectionConfig.toPrettyFieldName(dateRange.field)}</li>
            <li>Start: {TimeUtil.UNIXTimeToPrettyDate(dateRange.start)}</li>
            <li>End: {TimeUtil.UNIXTimeToPrettyDate(dateRange.end)}</li>
          </ul>
        </div>
      );
    }
    return null;
  };

  static __renderSelectedFacets = (selectedFacets) => {
    if (selectedFacets) {
      if (
        Object.keys(selectedFacets).length > 0 &&
        selectedFacets.constructor === Object
      ) {
        const facets = Object.keys(selectedFacets).map((k, i) => {
          const selected = selectedFacets[k].map((facet, i2) => {
            return <li key={"__sf__" + i + " " + i2}>{facet}</li>;
          });
          return (
            <div key={"__sfn__" + i}>
              <strong>Facet name:</strong> {k}
              <ul>{selected}</ul>
            </div>
          );
        });
        return (
          <div className="bg_queryDetails-wrapper">
            <p>
              <strong>Selected facets</strong>
            </p>
            <div className="bg__selectedFacet-list">{facets}</div>
          </div>
        );
      }
    }
    return null;
  };

  static __renderFieldsCategory = (fieldCategories) => {
    if (fieldCategories && fieldCategories.length > 0) {
      return (
        <div>
          <strong>Selected field clusters</strong>
          <ul>
            {fieldCategories.map((item, index) => {
              return <li key={"__field-categories__" + index}>{item.label}</li>;
            })}
          </ul>
        </div>
      );
    }
    return null;
  };

  static __renderEntities = (entities) => {
    if (entities && entities.length > 0) {
      return (
        <div>
          <strong>Selected entities</strong>
          <ul>
            {entities.map((item, index) => {
              return <li key={"__entities__" + index}>{item.label}</li>;
            })}
          </ul>
        </div>
      );
    }
    return null;
  };
}
