import PropTypes from "prop-types";
import MediaSegment from "./MediaSegment";

export default class MediaObject {
  constructor(
    assetId,
    devientTranscriptId,
    mimeType,
    url,
    contentId,
    contentServerId,
    mediaFragments,
    segments,
    resourceStart,
    resourceEnd,
    isRawContent,
    requiresPlayoutAccess,
    cors,
    title,
    duration = 0
  ) {
    this.assetId = assetId;

    this.mediaFragments = mediaFragments; //fragments, within the media object, that match the search term
    this.devientTranscriptId = devientTranscriptId; //needed for some variations in ASR transcript IDs
    this.mimeType = mimeType;
    this.url = url;

    this.contentId = contentId;
    this.contentServerId = contentServerId;

    this.segments = segments; //list of MediaSegment
    this.resourceStart = resourceStart;
    this.resourceEnd = resourceEnd;

    this.isRawContent = isRawContent;

    this.requiresPlayoutAccess = requiresPlayoutAccess;
    this.playoutAccess = !requiresPlayoutAccess; //playout access is false when using the playout proxy
    this.cors = cors;

    this.title = title;

    this.duration = duration;
  }

  isIIIFImage = () => {
    return (
      this.mimeType &&
      this.mimeType.indexOf("image") !== -1 &&
      this.cors !== false
    );
  };

  static construct = (obj, collectionConfig) => {
    return new MediaObject(
      obj.assetId,
      obj.devientTranscriptId,
      obj.mimeType,
      obj.url,
      obj.contentId,
      obj.contentServerId,
      obj.mediaFragments, //fragments, within the media object, that match the search term
      obj.segments, //curated segments
      obj.resourceStart, //on-air start time
      obj.resourceEnd, //on-air end time
      obj.isRawContent, //unedited material should not be made accessible (for current use cases)
      typeof obj.requiresPlayoutAccess === "boolean"
        ? obj.requiresPlayoutAccess
        : collectionConfig.requiresPlayoutAccess(),
      obj.cors,
      obj.title
    );
  };

  static getPropTypes = (isRequired = false) => {
    const mediaObjectShape = PropTypes.shape({
      url: PropTypes.string.isRequired,
      mimeType: PropTypes.string.isRequired,
      assetId: PropTypes.string.isRequired, // this should be a persistent ID

      contentId: PropTypes.string, // encoded asset ID for the content proxy
      contentServerId: PropTypes.string, // ID for the content proxy to decide which server to proxy
      mediaFragments: PropTypes.arrayOf(PropTypes.object),
      segments: PropTypes.arrayOf(MediaSegment.getPropTypes()),
      resourceStart: PropTypes.number, // start (sec) of on-air content or related segment
      resourceEnd: PropTypes.number, // end (sec) of on-air content or related segment

      isRawContent: PropTypes.bool, // raw content is material used to created the main media object that reflects the (media) resource

      playoutAccess: PropTypes.bool, // if the user is allowed to watch the video

      title: PropTypes.string,
    });
    return isRequired ? mediaObjectShape.isRequired : mediaObjectShape;
  };
}
