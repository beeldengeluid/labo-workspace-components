import React from "react";
import PropTypes from "prop-types";
import IDUtil from "../util/IDUtil";

const renderSpinner = (message) => (
  <div
    className={IDUtil.cssClassName("spinner")}
    title={message || "Loading the resource"}
  ></div>
);

const Loading = ({ message, fullScreen = true }) =>
  fullScreen ? (
    <div className={IDUtil.cssClassName("loading")}>
      {renderSpinner(message)}
    </div>
  ) : (
    renderSpinner(message)
  );

Loading.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loading;
