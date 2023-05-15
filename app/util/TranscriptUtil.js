import RegexUtil from "./RegexUtil";

export default class TranscriptUtil {
  //TODO get the number of matches per segment as well!
  //FIXME this is not used properly anymore!! See MediaColumn.renderAVPlaylist(...transcripts..)
  static calcTranscriptMatchesPerMediaObject = (
    mediaObjects,
    resourceTranscripts,
    initialSearchTerm
  ) => {
    if (!resourceTranscripts || !initialSearchTerm) return {};

    const matches = {};
    let regex = null;
    try {
      regex = RegexUtil.generateRegexForSearchTerm(initialSearchTerm);
    } catch (err) {
      console.debug("invalid regex");
    }
    if (regex) {
      mediaObjects.forEach((mo) => {
        const transcripts = resourceTranscripts[mo.assetId]; //transcripts for this media object
        transcripts.forEach((t) => {
          if (t.type === "ASR" && t.lines) {
            //NOTE: for now only count ASR matches
            matches[mo.assetId] = t.lines.reduce((acc, line) => {
              return acc + (line.text.match(regex) || []).length;
            }, 0);
          }
        });
      });
    }
    return matches;
  };
}
