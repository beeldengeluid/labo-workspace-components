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
    if (body.annotationType === "comment") {
      return body.text ? body.text.substring(0, 200) : "";
    } else if (body.annotationType === "classification") {
      return body.label;
    } else if (body.annotationType === "metadata") {
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
    return "-";
  },

};

export default AnnotationUtil;
