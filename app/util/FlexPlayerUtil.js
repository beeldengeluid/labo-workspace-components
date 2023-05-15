/* ---------------------------- CALCULATIONS RELATIVE TO ON-AIR DURATION --------------------------------- */

/*
	IMPORTANT NOTE: media objects that do NOT want to take into account off-air content, should have no resourceStart & resourceEnd params OR should set these to -1
					Otherwise the whole playout experience gets screwed up (incorrect timelines, invisible transcript etc)
*/

const FlexPlayerUtil = {
  onAirDuration(realPlayerDuration, mediaObject) {
    if (FlexPlayerUtil.containsOffAirContent(mediaObject)) {
      let duration = realPlayerDuration;
      if (FlexPlayerUtil.containsOffAirStartOffset(mediaObject)) {
        duration -= mediaObject.resourceStart;
      }
      if (FlexPlayerUtil.containsOffAirEndOffset(mediaObject)) {
        duration -= realPlayerDuration - mediaObject.resourceEnd;
      }
      return duration;
    }
    return realPlayerDuration;
  },

  timeRelativeToOnAir(realPlayerTime, mediaObject) {
    if (FlexPlayerUtil.containsOffAirContent(mediaObject)) {
      if (
        FlexPlayerUtil.containsOffAirStartOffset(mediaObject) &&
        realPlayerTime >= mediaObject.resourceStart
      ) {
        if (
          FlexPlayerUtil.containsOffAirEndOffset(mediaObject) &&
          realPlayerTime >= mediaObject.resourceEnd
        ) {
          return mediaObject.resourceEnd;
        } else {
          return realPlayerTime - mediaObject.resourceStart;
        }
      } else if (
        FlexPlayerUtil.containsOffAirEndOffset(mediaObject) &&
        realPlayerTime >= mediaObject.resourceEnd
      ) {
        return mediaObject.resourceEnd;
      }
    }
    return realPlayerTime;
  },

  seekRelativeToOnAir(playerAPI, relativeDurationPos, mediaObject) {
    let time = relativeDurationPos;
    if (FlexPlayerUtil.containsOffAirContent(mediaObject)) {
      time = relativeDurationPos + mediaObject.resourceStart;
    }
    playerAPI.seek(time);
  },

  isTimeBeforeOnAir(realPlayerTime, mediaObject) {
    return (
      FlexPlayerUtil.containsOffAirEndOffset(mediaObject) &&
      realPlayerTime <= mediaObject.resourceStart
    );
  },

  isTimeAfterOnAir(realPlayerTime, mediaObject) {
    return (
      FlexPlayerUtil.containsOffAirEndOffset(mediaObject) &&
      realPlayerTime >= mediaObject.resourceEnd
    );
  },

  containsOffAirContent(mediaObject) {
    return (
      FlexPlayerUtil.containsOffAirStartOffset(mediaObject) ||
      FlexPlayerUtil.containsOffAirEndOffset(mediaObject)
    );
  },

  containsOffAirStartOffset(mediaObject) {
    return (
      typeof mediaObject.resourceStart === "number" &&
      mediaObject.resourceStart > 0
    );
  },

  containsOffAirEndOffset(mediaObject) {
    return (
      typeof mediaObject.resourceEnd === "number" &&
      mediaObject.resourceEnd > 0 &&
      mediaObject.resourceEnd !== -1
    );
  },
};

export default FlexPlayerUtil;
