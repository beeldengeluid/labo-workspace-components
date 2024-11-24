import PropTypes from "prop-types";
import Tooltip from "./Tooltip";
import classNames from "classnames";
import "./Info.scss";

/**
 * Component with information icon and tooltip
 *
 * className could be e.g.: primary, secondary, black, grey, white, left
 * see Info.scss for all classes or add your own
 */

const Info = ({
  id,
  text,
  className,
  portalContainer,
  icon = "fas fa-info-circle",
}) => (
  <span
    className={classNames(
      "bg__info",
      className && {
        [className]: className,
      },
    )}
  >
    <i
      className={icon}
      data-tooltip-id={"tooltip__" + id}
      data-tooltip-html={text}
    />
    <Tooltip id={"tooltip__" + id} portalContainer={portalContainer} />
  </span>
);

Info.propTypes = {
  // unique identifier
  id: PropTypes.string.isRequired,
  // tooltip text
  text: PropTypes.string.isRequired,

  // (optional) className for styling
  className: PropTypes.string,
};

export default Info;
