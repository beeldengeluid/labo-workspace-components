import moment from "moment";

const TimeUtil = {
  UNIXTimeToPrettyDate(epochMillis) {
    if (epochMillis !== null) {
      return moment(epochMillis).format("DD-MM-YYYY");
    }
    return "-";
  },

  /* ---------------------- FUNCTIONS WORKING BASED ON CollectionConfig.getFormattedDates() ------------------------- */

  extractDate(formattedDate) {
    return formattedDate ? new Date(formattedDate) : null;
  },

  isPeriod(formattedDates) {
    // Checks for a range in the form "yyyy - yyyy".
    return (
      formattedDates &&
      formattedDates.length === 1 &&
      typeof formattedDates[0] === "string" &&
      formattedDates[0].split("-").length === 2
    );
  },

  //takes an array of formatted date strings or period strings and returns the timestamp of the earliest date (or period start)
  formattedDatesToLowestTimestamp(formattedDates) {
    if (!formattedDates) return null;

    if (!Array.isArray(formattedDates)) {
      formattedDates = [formattedDates];
    }
    // If found then returns the first year in the range as a TimeStamp.
    if (
      TimeUtil.isPeriod(formattedDates) &&
      typeof formattedDates[0] === "string"
    ) {
      return TimeUtil.extractDate(
        formattedDates[0].split("-").map((it) => it.trim())[0],
      ).getTime();
    }
    return formattedDates
      ? Math.min(
          ...formattedDates.map((fd) =>
            TimeUtil.extractDate(fd)
              ? TimeUtil.extractDate(fd).getTime()
              : null,
          ),
        )
      : null;
  },

  sortedFormattedDates(formattedDates) {
    return formattedDates
      ? formattedDates.sort((a, b) =>
          TimeUtil.extractDate(a) > TimeUtil.extractDate(b) ? 1 : -1,
        )
      : null;
  },
};

export default TimeUtil;
