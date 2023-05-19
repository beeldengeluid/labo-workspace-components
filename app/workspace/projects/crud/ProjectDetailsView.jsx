import React, { useEffect } from "react";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import SessionStorageHandler from "../../../util/SessionStorageHandler";
import ProjectViewWrapper from "../ProjectViewWrapper";
import { Link } from "react-router-dom";
import "./ProjectDetailsView.scss";
/**
 * Show the details of the given project.
 */

// the ProjectDetailsView is wrapped in a ProjectViewWrapper and returned to the Router
// eslint-disable-next-line no-unused-vars
const WrappedProjectDetailsView = ({ clientId, user, params, recipe }) => {
  return (
    <ProjectViewWrapper
      renderComponent={ProjectDetailsView}
      clientId={clientId}
      user={user}
      params={params}
      recipe={recipe}
    />
  );
};

WrappedProjectDetailsView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

const WORKSPACE_TAB_ID = "bg__project-tab";
const WORKSPACE_PROJECT_DETAILS_TAB_ID = "details";

const ProjectDetailsView = ({
  clientId, // eslint-disable-line no-unused-vars
  user, // eslint-disable-line no-unused-vars
  params, // eslint-disable-line no-unused-vars
  recipe, // eslint-disable-line no-unused-vars
  project,
  loadBookmarkCount, // eslint-disable-line no-unused-vars
  updateQueriesCount, // eslint-disable-line no-unused-vars
}) => {
  // React hook
  useEffect(() => {
    // store tab to sessionStorage
    SessionStorageHandler.set(
      WORKSPACE_TAB_ID,
      WORKSPACE_PROJECT_DETAILS_TAB_ID
    );

    return () => console.log("End of ProjectBookmarkView lifecycle");
  }, []);

  // rendering everything
  return (
    <div className={IDUtil.cssClassName("project-details-view")}>
      <h2>Project Details</h2>
      <Link
        to={`/workspace/projects/${encodeURIComponent(project.id)}/edit`}
        className="btn"
      >
        Edit details
      </Link>
      <ul className="details">
        <li>
          <h5 className="label">Name</h5>
          <p>{project.name}</p>
        </li>
        <li>
          <h5 className="label">Description</h5>
          <p>{project.description}</p>
        </li>
        <li>
          <h5 className="label">Created</h5>
          <p>{project.created.substring(0, 10)}</p>
        </li>
      </ul>
    </div>
  );
};

ProjectDetailsView.propTypes = {
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

export default WrappedProjectDetailsView;
