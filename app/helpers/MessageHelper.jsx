import React from "react";
import TimeUtil from "../util/TimeUtil";

export default class MessageHelper {
  static renderDateFieldTooltip = (cssClass) => {
    return (
      <div className={cssClass}>
        To generate a timeline visualization of the number of results for your
        query, you have to pick up a date field
        <br />
        <br />
        Each collection has different date fields to choose from, which are not
        always 100% complete
        <br />
        <br />
        The Media Suite includes a &quot;Preferred&quot; field per collection,
        which is the most complete field
        <br />
        <br />
        But please note that if you filter using some of those fields, you may
        be excluding some results
        <br />
        <br />
        See also &quot;Help/HowTos&quot; menu
      </div>
    );
  };

  static renderDateTotalStatsTooltip = (cssClass) => {
    return (
      <div className={cssClass}>
        Please note that the statistical unit (what is being counted) are
        documents (programs, articles, interviews), and not the number of
        occurrences of the term within a document
        <br />
        <br />
        Please also note that each record possibly can have multiple occurrences
        of the selected date field (e.g., a rebroadcast), making it possible
        that there are more dates found than the number of search results
        <br />
        <br />
        See also &quot;Help/HowTos&quot; menu
      </div>
    );
  };

  static renderCategorySelectorTooltip = (cssClass) => {
    return (
      <div className={cssClass}>
        Here you can select a cluster of fields to search in, to facilitate more
        precise queries.
        <br />
        You can also create your own cluster, selecting exactly the metadata
        fields you would like to search in. Simply start typing in the name of
        your new cluster and click on &apos;Create...&apos; when it appears.
        <br />
        See &quot;Help/HowTos&quot; menu for Search for more details, including
        the effect that using a cluster has on your search results
      </div>
    );
  };

  static renderKeywordSelectorTooltip = (cssClass) => {
    return (
      <div className={cssClass}>
        To generate a histogram visualization of the number of results per facet
        value for your query, you have to select a keyword field (facet). <br />
        <br />
        Each collection has different keyword fields to choose from, which are
        not always 100% complete
        <br />
        <br />
        But please note that if you filter using some of those fields, you may
        be excluding some results
        <br />
        <br />
        See also &quot;Learn/HowTos&quot; menu
      </div>
    );
  };

  static renderNoDocumentsWithDateFieldMessage = () => {
    return (
      <div className="alert alert-danger">
        <strong>Notice:</strong> None of the search results contain the selected
        date field, so plotting a timeline based on this field is not possible.
        <br />
        <br />
        Try selecting another date field if you are interested in how the search
        results are distributed over time (based on the selected date field).
      </div>
    );
  };

  static renderNoDocumentsWithTermFieldMessage = () => {
    return (
      <div className="alert alert-danger">
        <strong>Notice:</strong> None of the search results contain the selected
        keyword field, so plotting a histogram based on this field is not
        possible.
        <br />
        <br />
        Try selecting another keyword field.
      </div>
    );
  };
  static renderNoSearchResultsMessage = (query, clearSearchFunc) => {
    return (
      <div>
        <h4>Your query did not yield any results</h4>
        {MessageHelper.renderQuery(query)}
        <strong>Note:</strong> Please try to refine or clear your search
        <button
          onClick={() => clearSearchFunc()}
          type="button"
          className="btn btn-primary btn-xs bg__clear-query-btn"
        >
          Clear search
        </button>
      </div>
    );
  };

  static renderQueryForTooltip = (query, collectionConfig) => {
    return (
      <div>
        {MessageHelper.renderQuery(query, collectionConfig)}
        <div className="bg__copyToClipboardMSN">On click copy to clipboard</div>
      </div>
    );
  };

  static renderPagingOutOfBoundsMessage = (resetSearchFunction) => {
    return (
      <div>
        <strong>Note:</strong> Currently the search engine cannot look as far as
        the selected page. Narrowing down your search parameters to reduce the
        amount of results avoids this restriction.
        <br />
        <br />
        Back to initial search result page&nbsp;
        <button
          className="btn btn-primary btn-xs"
          type="button"
          onClick={() => resetSearchFunction()}
        >
          Reset page
        </button>
      </div>
    );
  };

  static renderQueryAccessDeniedMessage = (resetSearchFunction) => {
    return (
      <div>
        <strong>Note:</strong> To view the results of this query you must log
        in. If you are already logged in, then you are either:
        <ul>
          <li>Trying to access a private query</li>
          <li>Trying to access a query that does not exist (anymore)</li>
          <li>Trying to run a query that targets a restricted collection</li>
        </ul>
        To continue, either select a collection or reset the page
        <br />
        <br />
        <button
          className="btn btn-primary btn-xs"
          type="button"
          onClick={() => resetSearchFunction()}
        >
          Reset page
        </button>
      </div>
    );
  };
  /* -------------------------------- PARTIAL RENDERING FUNCTIONS --------------------------- */

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

  static renderQuery = (query, collectionConfig) => {
    return (
      <div>
        <div className="bg_queryDetails-wrapper">
          <strong>Search Term:</strong> {query.term}
        </div>
        {MessageHelper.__renderDateRange(query.dateRange, collectionConfig)}
        {MessageHelper.__renderSelectedFacets(
          MessageHelper.__getFormattedSelectedFacets(query)
        )}
        {MessageHelper.__renderFieldsCategory(query.fieldCategory)}
        {MessageHelper.__renderEntities(query.entities)}
      </div>
    );
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
