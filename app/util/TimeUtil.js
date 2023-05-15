import moment from "moment";
//TODO replace with one of these
//https://date-fns.org/
//https://moment.github.io/luxon/

//TODO only load when needed (use code splitting)

const TimeUtil = {
  //formats seconds to a neat time string hh:mm:ss
  formatTime: function (t) {
    if (t === -1) {
      return "00:00:00";
    }
    const pt = moment.duration(t * 1000);
    const h = pt.hours() < 10 ? "0" + pt.hours() : pt.hours();
    const m = pt.minutes() < 10 ? "0" + pt.minutes() : pt.minutes();
    const s = pt.seconds() < 10 ? "0" + pt.seconds() : pt.seconds();
    return h + ":" + m + ":" + s;
  },

  //formats milliseconds to a time string hh:mm:ss
  formatMillisToTime: function (millis) {
    if (millis === -1) {
      return "00:00:00";
    }
    const pt = moment.duration(millis);
    const h = pt.hours() < 10 ? "0" + pt.hours() : pt.hours();
    const m = pt.minutes() < 10 ? "0" + pt.minutes() : pt.minutes();
    const s = pt.seconds() < 10 ? "0" + pt.seconds() : pt.seconds();
    return h + ":" + m + ":" + s;
  },

  //TODO not sure anymore why this was useful. It seems bad to round off seconds
  playerPosToMillis: function (sec) {
    //a double
    return parseInt(sec) * 1000;
  },

  getYearFromDate: function (dateMillis) {
    return new Date(dateMillis).getFullYear();
  },

  yearToUNIXTime: function (year) {
    return new Date(year + "-01-01").valueOf();
  },

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
        formattedDates[0].split("-").map((it) => it.trim())[0]
      ).getTime();
    }
    return formattedDates
      ? Math.min(
          ...formattedDates.map((fd) =>
            TimeUtil.extractDate(fd) ? TimeUtil.extractDate(fd).getTime() : null
          )
        )
      : null;
  },

  sortedFormattedDates(formattedDates) {
    return formattedDates
      ? formattedDates.sort((a, b) =>
          TimeUtil.extractDate(a) > TimeUtil.extractDate(b) ? 1 : -1
        )
      : null;
  },

  dateToInterval(date_millis, interval) {
    //Converts date in epoch millis to the specified interval as a string
    let dateMoment = moment(new Date(date_millis));

    if (interval === "day") {
      let dayNumber = dateMoment.format("D");
      let monthName = dateMoment.format("MMM");
      let year = dateMoment.format("YYYY");
      return dayNumber + " " + monthName + " " + year;
    } else if (interval === "week") {
      let year = "";
      let monthName = "";
      let dayOfWeek = dateMoment.day();
      // get the week, month name and year from the Monday, to avoid the week being split over 2 months
      let monday = dateMoment;
      let daysToSubtract = 0;
      if (dayOfWeek !== 0) {
        daysToSubtract = dayOfWeek - 1;
      } else {
        daysToSubtract = 6;
      }
      monday.subtract(daysToSubtract, "days");
      let weekNumber = dateMoment.isoWeek();
      if (weekNumber === 1) {
        // for January, make an exception and use the month and year from the Sunday
        // as week 1 is associated with the month and year it ends in, not the ones it starts in
        let sunday = dateMoment;
        let daysToAdd = 0;
        if (dayOfWeek !== 0) {
          daysToAdd = 7 - dayOfWeek;
        } else {
          daysToAdd = 0;
        }
        sunday.add(daysToAdd, "days");
        monthName = sunday.format("MMM");
        year = sunday.format("YYYY");
      } else {
        // use the month name and year from the Monday
        monthName = monday.format("MMM");
        year = monday.format("YYYY");
      }
      return "week " + weekNumber + " (" + monthName + ") " + year;
    } else if (interval === "month") {
      let monthName = dateMoment.format("MMM");
      let year = dateMoment.format("YYYY");
      return monthName + " " + year;
    } else if (interval === "year") {
      return dateMoment.format("YYYY");
    }
  },

  //Given a date in millis, finds the start and end dates of the given interval (e.g. the first and last date
  //of the month the date is in) and return them in the given date format
  dateToStartAndEndInterval(date_millis, interval, dateFormat) {
    console.log("converting");
    console.log(date_millis);
    let dateMoment = moment(new Date(date_millis));
    console.log(dateMoment);
    let startMoment = null;
    let endMoment = null;

    if (interval === "day") {
      //start and end of the interval are just the date itself
      startMoment = dateMoment;
      endMoment = dateMoment;
    } else if (interval === "week") {
      startMoment = dateMoment.clone().startOf("isoWeek");
      endMoment = dateMoment.clone().endOf("isoWeek");
    } else if (interval === "month") {
      startMoment = dateMoment.clone().startOf("month");
      endMoment = dateMoment.clone().endOf("month");
    } else if (interval === "year") {
      startMoment = dateMoment.clone().startOf("year");
      console.log(startMoment);
      endMoment = dateMoment.clone().endOf("year");
      console.log(endMoment);
    }

    return [startMoment.format(dateFormat), endMoment.format(dateFormat)];
  },
};

export default TimeUtil;
