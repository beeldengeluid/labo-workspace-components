//Generic functions for UI components
import moment from "moment";
export default class ComponentUtil {
  //windows.confirm cannot be easily mocked (for unit testing), but this function can
  static userConfirm = (msg) => {
    return window.confirm(msg);
  };

  //shows the only FlexModal attached to a component
  static showModal = (component, stateVariable) => {
    const stateObj = {};
    stateObj[stateVariable] = true;
    component.setState(stateObj);
  };

  //hides a FlexModal (used in AggregationBox, ItemDetailsRecipe, SearchHit)
  static hideModal = (
    component,
    stateVariable,
    elementId,
    manualCloseRequired,
    callback
  ) => {
    const stateObj = {};
    stateObj[stateVariable] = false;
    if (elementId && manualCloseRequired) {
      $("#" + elementId).modal("hide");
    }
    component.setState(stateObj, () => {
      if (callback) {
        callback();
      }
    });
  };

  /*--------------------------------------------------------------------------------
    * ------------------------- NUMBER FORMATTING METHOD -----------------------------
    ---------------------------------------------------------------------------------*/

  static calcCompleteness = (fieldCount, totalCount) => {
    if (totalCount <= 0) return 0;
    return parseFloat((fieldCount * 100) / totalCount).toFixed(2);
  };

  static formatNumber = (number) => {
    if (!isNaN(number)) {
      return number.toLocaleString();
    }
    console.error("Tried to format a non-number", number);
    return "0";
  };

  static formatLabel = (label) => {
    const maxLength = 20;
    return label.length > maxLength
      ? label.substring(0, maxLength) + "..."
      : label;
  };

  static filterWeirdDates = (aggregations, dateRange, collectionConfig) => {
    if (dateRange && aggregations && collectionConfig) {
      const buckets = aggregations[dateRange.field];

      if (buckets && buckets.length > 0) {
        const desiredMinYear = collectionConfig.getMinimumYear();
        const desiredMaxYear = collectionConfig.getMaximumYear();
        let maxDate = null;

        if (desiredMaxYear !== -1) {
          maxDate = moment().set({ year: desiredMaxYear, month: 0, date: 1 });
        } else {
          maxDate = moment();
        }

        let i = buckets.findIndex((d) => {
          return desiredMinYear === moment(d.date_millis, "x").year();
        });
        i = i === -1 ? 0 : i;

        let j = buckets.findIndex((d) => {
          return maxDate.isBefore(moment(d.date_millis, "x"));
        });
        j = j === -1 ? buckets.length - 1 : j;

        if (!(i === 0 && j === buckets.length - 1)) {
          aggregations[dateRange.field] = aggregations[dateRange.field].splice(
            i,
            j - i
          );
        }
      }
    }
    return aggregations;
  };

  /*--------------------------------------------------------------------------------
    * ------------------------- METHOD FOR Cannot read property 'name' of undefined"-----------------------------
    ---------------------------------------------------------------------------------*/
  static getSafe = (fn, defaultVal = null) => {
    try {
      return fn();
    } catch (e) {
      return defaultVal;
    }
  };

  /*--------------------------------------------------------------------------------
    * ------------------------- METHOD Sorting arrays of string alphabetically regardless of the case,
    * default sorting is ascending if none is defined.
    * -----
    ---------------------------------------------------------------------------------*/
  static sortArrayOfStrings = (array, defaultSorting = "asc") => {
    console.log("sorting");
    return array.sort(function (a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      if (a === b) {
        return 0;
      } else if (defaultSorting === "desc") {
        return a > b ? -1 : 1;
      } else {
        return a < b ? -1 : 1;
      }
    });
  };

  //this function checks if there is any input field that has focus
  //TODO extend with textarea
  static checkFocusAndExec = (f, args) => {
    const inputs = [
      ...document.getElementsByTagName("input"),
      ...document.getElementsByTagName("textarea"),
    ];
    for (const i of inputs) {
      if (i === document.activeElement) {
        return true;
      }
    }
    if (f) {
      f(args);
    }
  };
}
