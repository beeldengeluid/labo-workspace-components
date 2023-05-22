import React from "react";
import PropTypes from "prop-types";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import IDUtil from "../../../util/IDUtil";
import { setBreadCrumbsFromMatch } from "../../helpers/BreadCrumbs";
import ProjectTable from "./ProjectTable";
import "./ProjectListView.scss";

/**
 * Top level component/page for the projects overview.
 * The data handling is done in the ProjectTable component.
 */
// eslint-disable-next-line no-unused-vars
const ProjectListView = ({ recipe, params, user, clientId }) => {
  const location = useLocation();

  // React hook
  useEffect(() => {
    setBreadCrumbsFromMatch(location.pathname);

    return () => console.log("End of ProjectListView lifecycle");
  }, []);

  return (
    <div className={IDUtil.cssClassName("project-list-view")}>
      <div className="info-bar">
        <Link to="/workspace/projects/create" className="btn primary add">
          Create User Project
        </Link>
        <h2>User Projects</h2>
        <p>Store and share Bookmarks, Annotations and Queries</p>
      </div>

      <ProjectTable user={user} />
    </div>
  );
};

ProjectListView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

export default ProjectListView;
