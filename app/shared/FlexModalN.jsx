import React from "react";
import PropTypes from "prop-types";

import IDUtil from "../util/IDUtil";

export default class FlexModalN extends React.PureComponent {
  render() {
    return (
      <div className={IDUtil.cssClassName("modal")}>
        <div
          className={
            this.props.size ? "container " + this.props.size : "container"
          }
        >
          <div className="close" onClick={this.props.onClose}>
            Close
          </div>
          {this.props.children}
        </div>
      </div>
    );
  }
}

FlexModalN.propTypes = {
  onClose: PropTypes.func.isRequired,
  size: PropTypes.string, //large is default; medium, small
  children: PropTypes.node.isRequired,
};
