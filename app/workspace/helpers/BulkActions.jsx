import React from "react";
import IDUtil from "../../util/IDUtil";
import PropTypes from "prop-types";
import "./BulkActions.scss";

/**
 * A dropdown with actions, that can be applied on multiple items
 */

export default class BulkActions extends React.PureComponent {
  onAction = async (action) => {
    await this.executeAction(action);
    if (this.props.onActionDone) {
      this.props.onActionDone();
    }
  };

  executeAction = (action) => {
    return new Promise((resolve) => {
      action.onApply(this.props.selection);
      resolve(true);
    });
  };

  render() {
    // don't render if there are no items selected
    if (this.props.selection.length == 0) return null;

    return (
      <div className={IDUtil.cssClassName("bulk-actions")}>
        <span>With {this.props.selection.length} selected:</span>
        {this.props.bulkActions.map((action, index) => (
          <div
            className="btn primary"
            key={index}
            onClick={() => {
              this.onAction(action);
            }}
          >
            {action.title}
          </div>
        ))}
      </div>
    );
  }
}

BulkActions.propTypes = {
  bulkActions: PropTypes.array.isRequired,
  selection: PropTypes.array.isRequired,
  onActionDone: PropTypes.func,
};
