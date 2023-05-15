import PropTypes from "prop-types";
import MediaObject from "./MediaObject";
import RegexUtil from "../util/RegexUtil";

//expresses a search result for the result list and the resource viewer
//also takes care of showing highlights and determines the snippets to be shown in the result list
//the provided collectionConfig can influence the outcome of this class' (viewing) functions
export default class Resource {
  //the constructor is never called directly, instead Resource.construct is called
  constructor(
    index,
    docType,
    resourceId,
    collectionId,
    title,
    description,
    date,
    dateField,
    specialProperties,
    externalSourceInfo,
    playableContent,
    playable,
    mediaTypes,
    rawData,
    tags = null,
    posterURL = null,
    mediaFragment = null,
    matchesPerField = null,
    searchTerm = null,
    entities = null,
    transcripts = null
  ) {
    this.index = index; //ES index
    this.docType = docType; //ES doc_type
    this.resourceId = resourceId; // ID of the resource, the resource is the "thing" shown in the resource viewer
    this.collectionId = collectionId; //should match the ES index (have to check)
    this.title = title; // title of the resource
    this.description = description; // description of the resource
    this.date = date; // date related to the resource (depends on collection what it means)
    this.dateField = dateField; // date field used to populate the date value
    this.specialProperties = specialProperties; // resource properties that should be prominent in the resource viewer
    this.externalSourceInfo = externalSourceInfo; // [{url : '', message : ''} to express related external source (FIXME not shown in new RV!)]
    this.playableContent = playableContent; // playable (AV) content representing the resource (instance of MediaObject)
    this.playable = playable; //whether this resource is playable (in search mode sometimes content is not available, so this variable can be used to convey that in the resource viewer there will be content)
    this.mediaTypes = mediaTypes; // media types of the playable content (used to draw representative icons)
    this.rawData = rawData; // all resource metadata returned by ES

    //media fragment related (bit outdated, but still relevant; need investigation)
    this.tags = tags; // showing e.g. manual annotations on the resource level (used by MotU)
    this.posterURL = posterURL; // showing a poster, representing the resource
    this.mediaFragment = mediaFragment; // instance of SearchResultMediaFragment, NB currently only used by MotU

    //calculated fields (based on query and collectionConfig)
    this.matchesPerField = matchesPerField;
    this.searchTerm = searchTerm; //required for highlighting the matches in the snippet & quick viewer

    this.entities = entities; //for storing named entities (see ResourceViewer.fetchEntitiesInResource)

    this.transcripts = transcripts;
  }

  //constructs a UI friendly SearchResult object using raw ES data + query + collectionConfig
  static construct(rawSearchResult, query, collectionConfig) {
    // the result data formatted according to the collectionConfig
    const mappedData = collectionConfig.getItemDetailData(
      rawSearchResult,
      query && query.dateRange ? query.dateRange.field : null
    );

    //convert the playable content to UI friendly MediaObjects
    //TODO this step should be done in all collectionConfig.getItemDetailData!
    let playableContent = null;
    if (mappedData.playableContent && mappedData.playableContent.length > 0) {
      playableContent = mappedData.playableContent.map((mo) =>
        MediaObject.construct(mo, collectionConfig)
      );
    }

    //highlights from all the fields
    // let matchesPerField = query && query.searchRegex ?
    // 	Resource.__getMatchesPerField(
    // 		mappedData,  // TODO: move to serverside. mappedData now only contains the 'showed' data (title, desc etc)
    // 		query.searchRegex,
    // 		collectionConfig.getForbiddenHighlightFields() || [] //make sure it's always filled
    // 	) :
    // 	null
    // ;

    let matchesPerField = {};

    //add the ES highlights here (TODO merge with above in a more nice way)
    if (mappedData.highlights) {
      matchesPerField = matchesPerField ? matchesPerField : {};
      Object.keys(mappedData.highlights).forEach((field) => {
        const normalizedField = field.replaceAll(".keyword", ""); //filter out multi field duplicates
        if (!matchesPerField[normalizedField]) {
          //check if the field without keyword was already there
          matchesPerField[normalizedField] = new Set(
            mappedData.highlights[field].map(
              //somehow ES gives duplicates as well...
              (emString) =>
                emString.replaceAll("<em>", "").replaceAll("</em>", "")
            )
          );
        }
      });
    }

    //make sure to convert the Sets to Arrays
    //FIXME make sure __getMatchesPerField returns the right object!
    if (matchesPerField) {
      Object.keys(matchesPerField).forEach((f) => {
        matchesPerField[f] = Array.from(matchesPerField[f]);
      });
    }

    return new Resource(
      mappedData.index,
      mappedData.docType,
      mappedData.resourceId,
      mappedData.collectionId,
      mappedData.title,
      mappedData.description,
      mappedData.date,
      mappedData.dateField,
      mappedData.specialProperties,
      mappedData.externalSourceInfo,
      playableContent, // instances of MediaObject
      mappedData.playable,
      mappedData.mediaTypes,
      mappedData.rawData,

      //tags, poster & media fragment fields (bit outdated, so have to check better; required by MotU)
      mappedData.tags,
      mappedData.posterURL,
      mappedData.mediaFragment, // only used in MotU

      //for highlighting matches in metadata
      matchesPerField,
      query ? query.term : null,

      //no named entities are available at this point, but are set later via setEntities
      //(e.g. see ResourceViewer loading process)
      null,

      mappedData.transcripts
    );
  }

  //entities are asynchronously fetched in different ways per collection, therefore they are set separately
  setEntities = (entities) => {
    this.entities = entities;
  };

  //transform into a search snippet (pass the collection config to influence the result)
  toSearchResultSnippet(collectionConfig) {
    //populate the list of media types, merging general collection level media types with result specific types
    let mediaTypes = collectionConfig.getCollectionMediaTypes();
    if (this.mediaTypes) {
      mediaTypes = mediaTypes.concat(
        this.mediaTypes.filter((mt) => !mediaTypes.includes(mt))
      );
    }

    //highlight count (to determine whether to show highlights or a "no highlights found" message)
    const numHighlights =
      this.matchesPerField && Object.keys(this.matchesPerField).length !== 0
        ? Object.keys(this.matchesPerField).reduce(
            (acc, cur) => (acc += this.matchesPerField[cur].length),
            0
          )
        : 0;
    return {
      //TODO create an object (SearchSnippet.js) for this as well (in the model package)
      id: this.resourceId,
      type: this.docType,
      title: this.title || "No title for: " + this.resourceId + "",
      date: this.date,
      description: this.description,
      posterURL: this.posterURL,
      mediaFragment: this.mediaFragment,
      tags: this.tags ? this.tags : [],
      mediaTypes: mediaTypes,
      playable: collectionConfig.isResourcePlayable(this),

      //for highlighting
      highlightRegex: RegexUtil.generateRegexForSearchTerm(this.searchTerm),
      matchesPerField: this.matchesPerField,
      // this.searchTerm ?
      // 	this.__getMatchesPerFieldForSnippet(collectionConfig) :
      // 	null
      highlightMsg: this.searchTerm
        ? collectionConfig.getMatchingTermsMsg(numHighlights, true)
        : null,
    };
  }

  //------------------------------------- FOR HIGHLIGHTING ------------------------------------------

  //gets search term matches per metadata field; skips the forbidden fields
  /*
    static __getMatchesPerField(obj, searchRegex, forbiddenFields=[], snippetsPerField={}, baseField = null) {
        for(const field in obj) {
            if(obj.hasOwnProperty(field) && forbiddenFields.indexOf(field) === -1) {
                if (Array.isArray(obj[field])) { // in case the value is a list
                    Resource.__getMatchesPerField(obj[field], searchRegex, forbiddenFields, snippetsPerField, field); // <- recursive call
                } else if (typeof obj[field] === 'object') { // in case the value is an object
                    Resource.__getMatchesPerField(obj[field], searchRegex, forbiddenFields, snippetsPerField, null); // <- recursive call
                } else { // finally it's possible to add some highlights
                    const snippets = Resource.__getMatchedSnippetsForText(obj[field], searchRegex);

                    //Save the highlights in the snippetsPerField object, which is eventually returned to the caller
                    const keyField = baseField ? baseField : field;
                    if(snippets.length > 0) {
                        if(!(keyField in snippetsPerField)) {
                            snippetsPerField[keyField] = new Set();
                        }
                        //snippets.find(hl => hl.text == snippet)
                        snippetsPerField[keyField] = snippetsPerField[keyField].add(...snippets);
                    }
                }
            }
        }
        return snippetsPerField
    }

    // maxWords is not always honored. When a searchterm with quotes is longer than maxWords the whole quoted match will be returned.
    // maxWords is used as a "number of words to the left and right" of the matched term
    // FIXME if there are multiple matches, but all in a single phrase, this should only return one snippet per phrase!
    // FIXME in some case this yields the duplicate highlights! (search for: "smakelijk eten", it occurs in the first 10 results)
    static __getMatchedSnippetsForText(text, searchRegex, maxWords=4) {
        if(!text || !searchRegex) return [];

        const matchedSnippets = [];
        let matches = null;
        text = text.toString().replace(/\r?\n|\r|\s+/g, ' '); //removing new lines as descriptions are sometimes formatted
        if(searchRegex && text) {
            matches = text.match(searchRegex);
        }
        if(matches) {
            let startIndex = 0;
            matches.forEach(match => {
                const foundIndex = text.indexOf(match, startIndex);
                if (foundIndex !== -1) {
                    //Determine snippet
                    let begin = RegexUtil.nthIndexRight(text, ' ', maxWords + 1, foundIndex); // Searches for the maxWords' space before the match
                    let end = RegexUtil.nthIndex(text, ' ', maxWords, foundIndex + match.length); // Searches for the maxWords' space after the match
                    let snippet = '';

                    if(begin === -1) {
                        begin = 0;
                    }
                    if(end === -1) {
                        end = text.length;
                    }
                    if(begin > 0) {
                        snippet += '(...)';
                    }
                    snippet += text.substring(begin, end);
                    if(end < text.length) {
                        snippet += ' (...)';
                    }
                    matchedSnippets.push(snippet); //snippet to highlight later on
                    // We can continue searching from here instead of taking the whole array again...
                    startIndex = foundIndex + 1;
                }
            })
        }
        return matchedSnippets;
    }*/

  //based on the provided config, determine which matches should be highlighted in the snippet
  //returns a selection of fields from this.matchesPerField
  /*
    __getMatchesPerFieldForSnippet(collectionConfig) {
        const highlightFields = collectionConfig.getPreferredHighlightFields();
        if(!highlightFields || !this.matchesPerField) return {};

        const snippetHighlights = {}
        const numberOfHighlightsToDisplay = collectionConfig.getNumberOfHighlightsToDisplay();
        for(const field of highlightFields) {

            //stop if we have enough already
            if(Object.keys(snippetHighlights).length == numberOfHighlightsToDisplay) {
                break;
            }
            if(field in this.matchesPerField) { //if the preferred highlight field is in the item highlights
                let newText = false;

                //check if the highlights are already shown in the item title and description, or they
                //contribute new text to the snippet
                for(let matchedSnippet of this.matchesPerField[field]) {
                    if(!matchedSnippet) continue;
                    matchedSnippet = matchedSnippet.replaceAll("(...)", "").trim();  //remove the parentheses
                    if(matchedSnippet.length < 30){
                        newText = true; //keep short highlights, as they don't take up much space and can be useful info such as names/locations
                        break; // as soon as we find a highlight part that is new, that is enough
                    }
                    //remove formatting from the description, as this messes up matching
                    let descriptionText = this.description.replace(/\r?\n|\r|\s+/g, ' ');
                    //check if our highlight text is new (not in either title or description)
                    newText = !this.title.includes(matchedSnippet) && !descriptionText.includes(matchedSnippet);
                    if(newText) break; // as soon as we find a highlight part that is new, that is enough
                }
                //if new text, add highlight
                if(newText) {
                    snippetHighlights[field] = this.matchesPerField[field];
                }
            }
        }
        return snippetHighlights;
    }*/

  static getPropTypes(isRequired = true) {
    const resourceShape = PropTypes.shape({
      index: PropTypes.string, //ES index
      docType: PropTypes.string, //ES doc_type
      resourceId: PropTypes.string, // ID of the resource, the resource is the "thing" shown in the resource viewer
      collectionId: PropTypes.string, //should match the ES index (have to check)
      title: PropTypes.string, // title of the resource
      description: PropTypes.string, // description of the resource
      date: PropTypes.string, // date related to the resource (depends on collection what it means)
      dateField: PropTypes.string, // date field used to populate the date value
      specialProperties: PropTypes.object, // resource properties that should be prominent in the resource viewer
      externalSourceInfo: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string,
          message: PropTypes.string,
        })
      ), // [{url : '', message : ''}] to express related external source (FIXME not shown in new RV!)
      playableContent: PropTypes.arrayOf(MediaObject.getPropTypes(false)), // playable (AV) content representing the resource (instance of MediaObject)
      mediaTypes: PropTypes.arrayOf(PropTypes.string), // media types of the playable content (used to draw representative icons)
      rawData: PropTypes.object, // all resource metadata returned by ES
      tags: PropTypes.arrayOf(PropTypes.string), // showing e.g. manual annotations on the resource level (used by MotU)
      posterURL: PropTypes.string, // showing a poster, representing the resource
      mediaFragment: PropTypes.object, // instance of SearchResultMediaFragment, NB currently only used by MotU
      matchesPerField: PropTypes.object,
      searchTerm: PropTypes.string, //required for highlighting the matched snippets
    });
    return isRequired ? resourceShape.isRequired : resourceShape;
  }
}
