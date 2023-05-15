import React from "react";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProjectAPI from "../../../api/ProjectAPI";
import IDUtil from "../../../util/IDUtil";
import { setBreadCrumbsFromMatch } from "../../helpers/BreadCrumbs";
import ProjectForm from "./ProjectForm";

/**
 * Edit the project as specified by the router, using the ProjectForm component
 */
// eslint-disable-next-line no-unused-vars
const ProjectEditView = ({ clientId, user, params, recipe }) => {
  // routing params
  const { projectId } = useParams();
  const location = useLocation();

  // for being able to redirect the user
  const navigate = useNavigate();

  // state
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);

  // React hook
  useEffect(() => {
    loadProject(user.id, projectId);

    return () => console.log("End of ProjectViewWrapper lifecycle");
  }, [projectId]);

  const loadProject = (userId, projId) => {
    // load project data, and set state
    ProjectAPI.get(userId, projId, (proj) => {
      // inject project name to breadcrumbs
      const titles = {};
      titles[proj.id] = proj.name;
      setBreadCrumbsFromMatch(location.pathname, titles);
      setLoading(false);
      setProject(proj);
    });
  };

  // render everything
  let contents = null;
  if (loading) {
    contents = <h3 className="loading">Loading...</h3>;
  } else if (project) {
    contents = (
      <ProjectForm
        submitButton="save"
        cancelLink={`/workspace/projects/'${encodeURIComponent(
          project.id
        )}/details`}
        project={project}
        projectDidSave={(projId) => {
          navigate(`/workspace/projects/${encodeURIComponent(projId)}/details`);
        }}
        user={user}
      />
    );
  } else {
    contents = <h3 className="error">Project could not be found</h3>;
  }

  return (
    <div className={IDUtil.cssClassName("project-edit")}>
      <div className="info-bar">
        <h2>Edit User Project</h2>
        <p>A user project contains Bookmarks & Annotations and Queries</p>
      </div>
      {contents}
    </div>
  );
};

ProjectEditView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

export default ProjectEditView;
