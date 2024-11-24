export const AnnotationTranslator = (annotation) => {
  switch (annotation.annotationType) {
    case "classification":
      return "code";
    case "metadata":
      return "metadata card";
    case "custom":
      if (annotation.role == "reflection") {
        return "reflection";
      }
      break;
  }
  return annotation.annotationType;
};
