import AnnotationAPI from "../api/AnnotationAPI";

const ReflectionUtil = {
  loadReflectionForBookmarkGroups(userId, projectId, callback) {
    const filter = {
      "user.keyword": userId,
      motivation: "bookmarking",
      project: projectId,
    };

    AnnotationAPI.getFilteredAnnotations(userId, filter, null, callback);
  },

  loadReflectionForTargetId(
    userId,
    projectId,
    target,
    scope,
    question,
    level,
    callback,
  ) {
    const filter = {
      // "user.keyword": userId,
      project: projectId,
      "target.source": target,
      "target.type": level,
    };

    const notFilter = {
      motivation: "bookmarking",
    };

    AnnotationAPI.getFilteredAnnotations(
      userId,
      filter,
      notFilter,
      (annotations) => {
        // Require a valid response
        if (!annotations || !Array.isArray(annotations)) {
          callback([]);
          return;
        }
        // Collection reflections
        const reflections = [];
        annotations.forEach((annotation) =>
          annotation.body?.forEach((body) => {
            if (
              body.annotationType == "custom" &&
              body.role == "reflection" &&
              body.scope?.id == scope?.id &&
              body.scope?.type == scope?.type
            ) {
              // Make question and level available on the annotation
              reflections.push({ ...body, question, level });
            }
          }),
        );

        // Callback
        callback(reflections);
      },
    );
  },
};

export default ReflectionUtil;
