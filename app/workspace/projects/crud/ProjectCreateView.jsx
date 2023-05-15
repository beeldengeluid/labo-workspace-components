import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import { setBreadCrumbsFromMatch } from "../../helpers/BreadCrumbs";
import ProjectForm from "./ProjectForm";

// eslint-disable-next-line no-unused-vars
const ProjectCreateView = ({ recipe, params, user, clientId }) => {
  // for being able to redirect the user
  const navigate = useNavigate();

  const location = useLocation();

  // React hook
  useEffect(() => {
    setBreadCrumbsFromMatch(location.pathname);

    return () => console.log("End of ProjectListView lifecycle");
  }, []);

  return (
    <div className={IDUtil.cssClassName("project-create")}>
      <div className="info-bar">
        <h2>Create User Project</h2>
        <p>A user project contains Bookmarks & Annotations and Queries</p>
      </div>

      <ProjectForm
        submitButton="create"
        cancelLink="/workspace/projects"
        project={{
          name: "",
          description: "",
          user: user.id,
        }}
        projectDidSave={(projectId) => {
          navigate(`/workspace/projects/${encodeURIComponent(projectId)}`);
        }}
        user={user}
      />
    </div>
  );
};

ProjectCreateView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

export default ProjectCreateView;
