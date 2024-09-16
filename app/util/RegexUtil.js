const RegexUtil = {
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
      console.debug(err);
      return null;
    }
  },
};
export default RegexUtil;
