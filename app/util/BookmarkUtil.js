import AnnotationUtil from "./AnnotationUtil";
import AnnotationAPI from "../api/AnnotationAPI";

export default class BookmarkUtil {
  static bookmarkToGroupInProject = (
    resourceId,
    collectionId,
    allGroups,
    selectedGroups,
    onSaveFunc
  ) => {
    //run through all the bookmark groups to check if this resource is a member. Then check if it should be a member or not (anymore)
    allGroups.forEach((group) => {
      const targets = group.target;
      const shouldBeMember = selectedGroups[group.id] === true; //should the resource be a member or not

      //first see if the resource is a member of the current group
      const index = targets.findIndex((t) => t.source === resourceId);

      //this check only updates the bookmark group (and calls the annotation API) if membership changed
      if (index !== -1) {
        // if already a member
        if (!shouldBeMember) {
          // ...and it shouldn't: remove it
          targets.splice(index, 1);
          group.target = targets;
          AnnotationAPI.saveAnnotation(group, onSaveFunc);
        }
      } else {
        //if not a member
        if (shouldBeMember) {
          // ...and it should be: add it
          targets.push(
            AnnotationUtil.generateResourceLevelTarget(collectionId, resourceId)
          );

          //FIXME remove: this deduplocation check should not be necessary?
          const temp = {};
          const dedupedTargets = [];
          targets.forEach((t) => {
            if (!temp[t.source]) {
              temp[t.source] = true;
              dedupedTargets.push(t);
            }
          });
          //set the deduped targets as the annotation target
          group.target = dedupedTargets;
          AnnotationAPI.saveAnnotation(group, onSaveFunc);
        }
      }
    });
  };

  //TODO move more bookmark related functions here
}
