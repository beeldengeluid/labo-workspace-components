/**
 * Annotation targets
 */

export const RESOURCE = "Resource";
export const MEDIAOBJECT = "MediaObject";
export const SEGMENT = "Segment";

export const ANNOTATION_TARGET = {
  RESOURCE,
  MEDIAOBJECT,
  SEGMENT,
};

/**
 * Annotation types
 */

export const CLASSIFICATION = "classification";
export const COMMENT = "comment";
export const LINK = "link";
export const METADATA = "metadata";

export const ANNOTATION_TYPE = {
  CLASSIFICATION,
  COMMENT,
  LINK,
  METADATA,
};

// Custom annotation types
export const CUSTOM = "custom";

export const SESSION_STORAGE_ACTIVE_TARGETS =
  "bg__annotation-column-active-targets";
export const SESSION_STORAGE_ACTIVE_TYPES =
  "bg__annotation-column-active-types";

export const SELECTION_TEMPORAL = "temporal";
export const SELECTION_SPATIAL = "spatial";

export const ANNOTATION_COLUMN_SEGMENT_ID = "ac-seg-";
