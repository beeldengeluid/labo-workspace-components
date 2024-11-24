import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { Tooltip as ReactTooltip } from "react-tooltip";

/**
 * Renders Tooltip on top of UI
 *
 * Uses a portal to mount the tooltip at the document.body
 *
 * Props: id, content
 */

const Tooltip = ({ id, content, portalContainer }) => (
  <>
    {createPortal(
      <ReactTooltip id={id} content={content} />,
      portalContainer || document.body,
    )}
  </>
);

Tooltip.propTypes = {
  id: PropTypes.string,
  content: PropTypes.node,
};

export default Tooltip;
