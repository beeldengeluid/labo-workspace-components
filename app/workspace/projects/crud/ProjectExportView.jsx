import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import ProjectAPI from "../../../api/ProjectAPI";
import { setBreadCrumbsFromMatch } from "../../helpers/BreadCrumbs";
import { exportDataAsJSON } from "../../helpers/Export";
import ProjectForm from "./ProjectForm";

// eslint-disable-next-line no-unused-vars
const ProjectExportView = ({ recipe, params, user, clientId }) => {

  const cancelLink="/workspace/projects";
  const submitButton="Export";
  const { projectId } = useParams();
  // for being able to redirect the user
  const navigate = useNavigate();

  const location = useLocation();
  const [loading, setLoading] = useState(true);

  const [exportType, setExportType] = useState('projectMetadata')
  const [project, setProject] = useState(null);

  // React hooks
  useEffect(() => {
    setBreadCrumbsFromMatch(location.pathname);

    return () => console.log("End of ProjectListView lifecycle");
  }, []);

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

  const handleSubmit = (e, proj) => {
    e.preventDefault();

    exportDataAsJSON(proj)

    return false;
  };

  let cancelButton = null;
  if (cancelLink && cancelLink !== "") {
    cancelButton = (
      <Link to={cancelLink} className="btn">
        Cancel
      </Link>
    );
  } else if (onCancel) {
    cancelButton = (
      <button className="btn" type="button" onClick={onCancel}>
        Cancel
      </button>
    );
  }

  let contents = null;
  if (loading) {
    contents = <h3 className="loading">Loading...</h3>;
  } else if (project) {
    contents = (
      <div>
          <table>
            <tbody>
              <tr>
                <td><label>Export project metadata - queries and annotations</label></td><td><input type="radio" label="Export project metadata" checked={exportType === 'projectMetadata'} value="projectMetadata" onChange={() => setExportType('projectMetadata')} /></td>
              </tr>
              <tr>
              <td><label>Export corpus to SANE</label></td><td><input type="radio" label="Export corpus to SANE" checked={exportType === 'corpusToSane'} value="corpusToSane" onChange={() => setExportType('corpusToSane')} /></td>
              </tr>
            </tbody>
          </table>
        {exportType === 'projectMetadata' ? 
          <div>
          <form
          className={IDUtil.cssClassName("project-form")}
          onSubmit={(e) => handleSubmit(e, project)}>
            <div className="actions">
          {cancelButton}
          <input type="submit" className="btn primary add" value={submitButton} />
        </div>
      </form>
          </div> : 
          <div>Add form here
            </div>}
        </div>
  )
  } else {
    contents = <h3 className="error">Project could not be found</h3>;
  }
  
  return (<div>{contents}</div>) ;
};

ProjectExportView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

export default ProjectExportView;
