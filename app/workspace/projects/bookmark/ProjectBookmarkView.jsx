import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import BookmarkTable from "./BookmarkTable";
import IDUtil from "../../../util/IDUtil";
import SessionStorageHandler from "../../../util/SessionStorageHandler";
import ProjectViewWrapper from "../ProjectViewWrapper";

/**
 * Main page for a project's bookmarks and annotations. This page mainly handles
 * the view selection: Bookmark- or Annotation centric.
 */

const KEYS = {
  view: "bg__project-bookmarks-view",
};

const WORKSPACE_TAB_ID = "bg__project-tab";
const WORKSPACE_BOOKMARKS_TAB_ID = "bookmarks";

// the ProjectBookmarkView is wrapped in a ProjectViewWrapper and returned to the Router
const WrappedProjectBookmarkView = ({ clientId, user, params, recipe }) => {
  return (
    <ProjectViewWrapper
      renderComponent={ProjectBookmarkView}
      clientId={clientId}
      user={user}
      params={params}
      recipe={recipe}
    />
  );
};

WrappedProjectBookmarkView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

const ProjectBookmarkView = ({
  clientId, // eslint-disable-line no-unused-vars
  user,
  params, // eslint-disable-line no-unused-vars
  recipe, // eslint-disable-line no-unused-vars
  project,
  loadBookmarkCount,
  updateQueriesCount, // eslint-disable-line no-unused-vars
}) => {
  const [annotations, setAnnotations] = useState([]); // eslint-disable-line no-unused-vars
  const [view, setView] = useState(
    SessionStorageHandler.get(KEYS.view, "bookmark-centric")
  );

  // React hook
  useEffect(() => {
    // instead of breaking out of the container, change the background color to a white and grey region
    document.body.style.background =
      "linear-gradient(180deg, white, white 343px, #faf6f6 343px, #faf6f6)";
    // store tab to sessionStorage
    SessionStorageHandler.set(WORKSPACE_TAB_ID, WORKSPACE_BOOKMARKS_TAB_ID);

    return () => {
      //reset background color of body
      document.body.style.background = "white";
      console.log("End of ProjectBookmarkView lifecycle");
    };
  }, []);

  const changeView = (view) => {
    // store view to session storage
    SessionStorageHandler.set(KEYS.view, view);
    setView(view);
  };

  const viewComponent =
    view === "bookmark-centric" ? (
      <BookmarkTable
        user={user}
        project={project}
        setView={changeView}
        loadBookmarkCount={loadBookmarkCount}
      />
    ) : null;
  return (
    <div className={IDUtil.cssClassName("project-data-view")}>
      <div className="tools"></div>
      {viewComponent}
    </div>
  );
};

ProjectBookmarkView.propTypes = {
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

export default WrappedProjectBookmarkView;
