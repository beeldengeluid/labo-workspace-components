import React from "react";
import AnnotationAPI from "../api/AnnotationAPI";

const AnnotationUtil = {
  generateResourceLevelTarget(collectionId, resourceId) {
    return {
      type: "Resource",
      source: resourceId,
      selector: {
        type: "NestedPIDSelector",
        value: [
          {
            id: collectionId,
            type: ["Collection"],
            property: "isPartOf",
          },
          {
            id: resourceId,
            type: ["Resource"],
            property: "isPartOf",
          },
        ],
      },
    };
  },

  annotationBodyToPrettyText(body) {
    // Comment
    if (body.annotationType === "comment") {
      return body.text ? body.text.substring(0, 200) : "";
    }
    // Comment
    if (body.annotationType === "link") {
      return (
        <a
          rel="noopener noreferrer"
          href={body.url ? body.url.replace(/^\/\//i, "") : ""}
          target="_blank"
        >
          {body.label || ""}
        </a>
      );
    }
    // Classification
    else if (body.annotationType === "classification") {
      return body.label;
    }
    // Metadata
    else if (body.annotationType === "metadata") {
      if (body.properties && body.properties.length > 0) {
        let text = body.properties[0].key;
        text +=
          ": " +
          (body.properties[0].value
            ? body.properties[0].value.substring(0, 200)
            : "");
        text += " (+ " + (body.properties.length - 1) + " other properties)";
        return text;
      }
    }
    // Custom
    else if (body.annotationType == "custom") {
      // Reflection
      if (body.role == "reflection") {
        return <i>{body.text}</i>;
      }
    }
    return "-";
  },

  loadBookmarkGroups(userId, projectId, callback) {
    const filter = {
      "user.keyword": userId,
      motivation: "bookmarking",
      project: projectId,
    };

    AnnotationAPI.getFilteredAnnotations(userId, filter, null, callback);
  },

  loadAnnotationsForTargetId(userId, projectId, target, callback) {
    const filter = {
      // "user.keyword": userId,
      project: projectId,
      "target.source": target,
    };

    const notFilter = {
      motivation: "bookmarking",
    };

    AnnotationAPI.getFilteredAnnotations(userId, filter, notFilter, callback);
  },
};

export default AnnotationUtil;
