import React from "react";
import PropTypes from "prop-types";
import FlexModalN from "../shared/FlexModalN";

/**
 * Modal (popup) that shows the details of an object. Currently in an iframe.
 * TODO move this component to a higher package, since it is reusable in other places as well
 */
export default class ResourceViewerModal extends React.PureComponent {
  /* Note: displaying the ItemDetailsRecipe in an overlay doesn't work smooth (css, dependencies, js errors)
        so, just show the page in an iframe for now.
        Todo: The creator/manager of ItemDetailsRecipe should be able to fix this. */

  /* <ItemDetailsRecipe recipe={yourItemDetailsRecipeData?}
        user={this.props.user}
        params={{id: this.state.viewObject.object.id, cid: this.state.viewObject.object.dataset}} /> */
  render() {
    return (
      <FlexModalN onClose={this.props.onClose}>
        <iframe
          src={
            "/tool/resource-viewer?id=" +
            encodeURIComponent(this.props.bookmark.resourceId) +
            "&cid=" +
            encodeURIComponent(this.props.bookmark.collectionId) +
            "&bodyClass=noHeader"
          }
        />
      </FlexModalN>
    );
  }
}

ResourceViewerModal.propTypes = {
  bookmark: PropTypes.shape({
    resourceId: PropTypes.string.isRequired,
    collectionId: PropTypes.string.isRequired,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};
