export default class ComponentUtil {
  //windows.confirm cannot be easily mocked (for unit testing), but this function can
  static userConfirm = (msg) => {
    return window.confirm(msg);
  };

  //hides a FlexModal (used in AggregationBox, ItemDetailsRecipe, SearchHit)
  static hideModal = (
    component,
    stateVariable,
    elementId,
    manualCloseRequired,
    callback,
  ) => {
    const stateObj = {};
    stateObj[stateVariable] = false;
    if (elementId && manualCloseRequired) {
      $("#" + elementId).modal("hide");
    }
    component.setState(stateObj, () => {
      if (callback) {
        callback();
      }
    });
  };
}
