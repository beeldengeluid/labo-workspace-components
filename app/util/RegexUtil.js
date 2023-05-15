const RegexUtil = {
  //test with: ƒ 1.000.000 AND leuzen
  highlightText(text, searchRegex) {
    if (text === null || !searchRegex) {
      return text;
    }

    return text.replace(
      searchRegex,
      (term) => "<span class='highLightText'>" + term + "</span>"
    );
  },

  /**
   * @desc Returns a Regular expression from the search term.
   *      Cases:
   *          1. Escape boolean expressions (NOT, OR, AND).
   *          Take care of this boolean appearing at the beginning/end of a search term.
   *          2. Remove extra spaces at the beginning/end of search term.
   *          3. Group terms as phrases when surrounded by double quotes (").
   *
   * @param term
   * @returns {RegExp}
   */
  generateRegexForSearchTerm(term) {
    //FIXME (maybe) this function is called for all queries of the selected project
    if (!term) return null;
    // Retrieve indexes of target as an array.
    const __getIndexesFromString = (s, target) => {
      let indexStart = 0;
      let arrIndexes = [];
      while (indexStart <= s.indexOf(target, indexStart)) {
        indexStart = s.indexOf(target, indexStart) + 1;
        arrIndexes.push(indexStart - 1);
      }
      return arrIndexes;
    };

    //returns array of double quoted phrases
    const __extractDoubleQuotedTerms = (s) => {
      const dqIndices = __getIndexesFromString(s, '"');
      if (dqIndices.length % 2 !== 0 || dqIndices.length === 0) return [];
      const dqTerms = [];
      let i = 0;
      while (i < dqIndices.length) {
        //e.g. for search term: 'muziekstuk "vuur en water"'
        dqTerms.push(s.slice(dqIndices[i] + 1, dqIndices[i + 1])); // => ['vuur en water']
        i += 2; //skip to the next pair
      }
      return dqTerms;
    };

    //returns array of single terms (that were not inside double quotes)
    const __getSingleTerms = (s, doubleQuotedTerms) => {
      let temp = new String(s);
      doubleQuotedTerms.forEach((dqt) => {
        //filter out the double quoted phrases
        temp = temp.replace('"' + dqt + '"', ""); //add the double quotes back since they were filtered out
      });
      temp = __removeBooleanTerms(temp);
      return temp.split(" ").filter((item) => item.length > 0);
    };

    // Remove boolean expressions from search term.
    const __removeBooleanTerms = (s) =>
      s.replace(/AND | AND| AND | OR |NOT | NOT| NOT | OR /g, " ");

    // escape wildcards.
    const __escapeWildCards = (s) => {
      s = s.replace(/[?]/g, "\\w");
      s = s.replace(/[*]/g, "(\\w*)");
      return s;
    };

    // Removes duplicated array items.
    const __filterNonUnique = (arr) => [...new Set(arr)];

    // remove extra spaces from within and before after the search expression.
    const trimmedTerm = term.replace(/\s+/g, " ").trim();

    const doubleQuotedTerms = __extractDoubleQuotedTerms(trimmedTerm);

    //add simple terms
    let extractedTerms = __getSingleTerms(trimmedTerm, doubleQuotedTerms); // => ['muziekstuk']

    //add quoted terms
    extractedTerms.push(...doubleQuotedTerms); //['vuur en water'] => ['vuur en water', 'muziekstuk']

    //always filter out the non-unique terms
    extractedTerms = __filterNonUnique(extractedTerms); // ['vuur en water', 'muziekstuk']

    try {
      // escape * wildcards.
      extractedTerms = extractedTerms.map((item) => __escapeWildCards(item));
      // add a word wrapper to every reg.exp.
      extractedTerms = extractedTerms.map((item) => "\\b" + item + "\\b");
      return extractedTerms && extractedTerms.length > 0
        ? new RegExp(extractedTerms.join("|"), "gi")
        : null;
    } catch (err) {
      return null;
    }
  },

  //for pruning long descriptions; makes sure to return the snippet that contains the search term
  //FIXME this function should be merged or removed
  findFirstHighlightInText(text, searchRegex = null, maxWords = 35) {
    if (!text) {
      return null;
    }
    if (Array.isArray(text)) {
      text = text.join("\n");
    }
    let index = 0;
    if (searchRegex) {
      index = text.toLowerCase().search(searchRegex);
    }
    index = index > 50 ? index - 50 : 0;
    text = text.substring(index);
    let words = text.split(" ");
    if (words.length > maxWords) {
      words = words.slice(index === 0 ? 0 : 1, maxWords);
    } else if (index !== 0) {
      words.splice(0, 1);
    }
    return words.join(" ");
  },

  // Searches for the n'th pattern in str, starting from start
  nthIndex(str, pat, n, start) {
    let i = -1;
    if (start > str.length) {
      return -1;
    } else {
      i = start;
    }
    while (n-- && i++ < str.length) {
      i = str.indexOf(pat, i);
      if (i < 0) break;
    }
    return i;
  },

  // Searches for the n'th last pattern in str, starting from start (count from left)
  nthIndexRight(str, pat, n, start) {
    let i = -1;
    if (start > str.length) {
      return -1;
    } else {
      i = start;
    }

    while (n-- && i-- <= str.length) {
      i = str.lastIndexOf(pat, i);
      if (i < 0) break;
    }
    return i;
  },
};
export default RegexUtil;
