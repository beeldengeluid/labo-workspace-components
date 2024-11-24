import React, { useState, useEffect } from "react";
import AnnotationTable from "./AnnotationTable";
import IDUtil from "../../../util/IDUtil";
import SessionStorageHandler from "../../../util/SessionStorageHandler";
import ProjectViewWrapper from "../ProjectViewWrapper";
import PropTypes from "prop-types";
import "./ProjectAnnotationView.scss";
/**
 * Main page for a project's bookmarks and annotations. This page mainly handles
 * the view selection: Bookmark- or Annotation centric.
 */

const KEYS = {
  view: "bg__project-annotation-view",
};

const WORKSPACE_TAB_ID = "bg__project-tab";
const WORKSPACE_ANNOTATIONS_TAB_ID = "annotations";

const getCurrentView = () => {
  // get current view from window location hash, or sessionStorage, or fallback to classification-centric
  switch (window.location.hash) {
    case "#classification-centric":
      return "classification-centric";
    case "#comment-centric":
      return "comment-centric";
    case "#link-centric":
      return "link-centric";
    case "#metadata-centric":
      return "metadata-centric";
    case "#custom-centric":
      return "custom-centric";
    default:
      // get view from session storage (bookmark-centric OR annotation-centric)
      return SessionStorageHandler.get(KEYS.view, "classification-centric");
  }
};

// the ProjectAnnotationView is wrapped in a ProjectViewWrapper and returned to the Router
// eslint-disable-next-line no-unused-vars
const WrappedProjectAnnotationView = ({ clientId, user, params, recipe }) => {
  return (
    <ProjectViewWrapper
      renderComponent={ProjectAnnotationView}
      clientId={clientId}
      user={user}
      params={params}
      recipe={recipe}
    />
  );
};

WrappedProjectAnnotationView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

const ProjectAnnotationView = ({
  clientId, // eslint-disable-line no-unused-vars
  user,
  params, // eslint-disable-line no-unused-vars
  recipe, // eslint-disable-line no-unused-vars
  project,
  loadBookmarkCount,
  updateQueriesCount, // eslint-disable-line no-unused-vars
}) => {
  const [annotations, setAnnotations] = useState([]); // eslint-disable-line no-unused-vars
  const [view, setView] = useState(getCurrentView());

  // React hook
  useEffect(() => {
    // instead of breaking out of the container, change the background color to a white and grey region
    document.body.parentElement.style.minHeight = "100vh";
    document.body.style.backgroundColor = "#faf6f6";
    document.body.style.backgroundImage =
      "linear-gradient(180deg, white, white 440px, transparent 440px, transparent)";
    // store tab to sessionStorage
    SessionStorageHandler.set(WORKSPACE_TAB_ID, WORKSPACE_ANNOTATIONS_TAB_ID);

    return () => {
      //reset background color of body
      document.body.style.background = "white";
      console.log("End of ProjectAnnotationView lifecycle");
    };
  }, []);

  const changeView = (e) => {
    const view = e.target.value;
    // store view to session storage
    SessionStorageHandler.set(KEYS.view, view);
    // update location hash
    window.location.hash = "#" + view;
    setView(view);
  };

  // rendering
  let viewComponent = null;
  const defaultProps = {
    user: user,
    project: project,
    setView: changeView,
    loadBookmarkCount: loadBookmarkCount,
  };

  switch (view) {
    case "classification-centric":
      viewComponent = (
        <AnnotationTable
          {...defaultProps}
          key="classification"
          type="classification"
          title="Codes"
          filters={["search", "vocabulary", "bookmarkGroup"]}
          sort={["created", "a-z-label", "z-a-label", "vocabulary"]}
        />
      );
      break;

    case "comment-centric":
      viewComponent = (
        <AnnotationTable
          {...defaultProps}
          key="comments"
          type="comment"
          title="Comments"
          filters={["search", "classification", "bookmarkGroup"]}
          sort={["created", "a-z-text", "z-a-text"]}
        />
      );
      break;

    case "link-centric":
      viewComponent = (
        <AnnotationTable
          {...defaultProps}
          key="links"
          type="link"
          title="Links"
          filters={["search", "classification", "bookmarkGroup"]}
          sort={["created", "a-z-label", "z-a-label"]}
        />
      );
      break;

    case "metadata-centric":
      viewComponent = (
        <AnnotationTable
          {...defaultProps}
          key="metadata"
          type="metadata"
          title="Metadata cards"
          filters={["search", "classification", "bookmarkGroup"]}
          sort={["created", "template"]}
        />
      );
      break;

    case "custom-centric":
      viewComponent = (
        <AnnotationTable
          {...defaultProps}
          key="custom"
          type="custom"
          title="Custom"
          filters={["search", "classification", "bookmarkGroup"]}
          sort={["created", "a-z-text", "z-a-text"]}
        />
      );
      break;
  }

  return (
    <div className={IDUtil.cssClassName("project-data-view")}>
      <div className="tools">
        <div className="view">
          <h3>Type</h3>
          <div className="radiogroup">
            <input
              type="radio"
              name="view"
              value="classification-centric"
              id="view-classification"
              checked={view === "classification-centric"}
              onChange={changeView}
            />

            <label htmlFor="view-classification">Codes</label>

            <input
              type="radio"
              name="view"
              value="comment-centric"
              id="view-comment"
              checked={view === "comment-centric"}
              onChange={changeView}
            />

            <label htmlFor="view-comment">Comments</label>

            <input
              type="radio"
              name="view"
              value="link-centric"
              id="view-link"
              checked={view === "link-centric"}
              onChange={changeView}
            />

            <label htmlFor="view-link">Links</label>

            <input
              type="radio"
              name="view"
              value="metadata-centric"
              id="view-metadata"
              checked={view === "metadata-centric"}
              onChange={changeView}
            />

            <label htmlFor="view-metadata">Metadata cards</label>

            <input
              type="radio"
              name="view"
              value="custom-centric"
              id="view-custom"
              checked={view === "custom-centric"}
              onChange={changeView}
            />
            <label htmlFor="view-custom">Custom</label>
          </div>
        </div>
      </div>
      {viewComponent}
    </div>
  );
};

ProjectAnnotationView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    created: PropTypes.string,
  }),
  loadBookmarkCount: PropTypes.func,
  updateQueriesCount: PropTypes.func,
};

export default WrappedProjectAnnotationView;
