import React, { useRef, useState, useEffect } from "react";
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

  const nameExportRef = useRef(null);
  const namePersonRef = useRef(null);
  const emailRef = useRef(null);
  const affiliationRef = useRef(null);
  const collaborativeOrganisationRef = useRef(null);
  const descRef = useRef(null);

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

  const handleProjectMetadataSubmit = (e, proj) => {
    e.preventDefault();

    exportDataAsJSON(proj)

    return false;
  };

  const handleCorpusSubmit = (e, proj) => {
    e.preventDefault();
    alert("Need to implement sending \"" + nameExportRef.current?.value + "\" to the Set API and email data provider")

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
      <h2>Export User Project "{project.name}"</h2>
      <p>On this page you can export the metadata describing "{project.name}" or request to send your corpus, consisting of the metadata of the items in your bookmark groups and queries, to the SANE environment for analysis</p>
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
            onSubmit={(e) => handleProjectMetadataSubmit(e, project)}>
              <div className="actions">
                {cancelButton}
                <input type="submit" className="btn primary add" value={submitButton} />
              </div>
            </form>
          </div> : 
          <div>
            <form
            className={IDUtil.cssClassName("project-form")}
            onSubmit={(e) => handleCorpusSubmit(e, project)}>
                <div className="new-project-container">
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">Name of export</label>
                    <input
                      type="text"
                      name="nameExport"
                      required={true}
                      className="project-modal-right"
                      placeholder="Name of export"
                      ref={nameExportRef}
                    />
                  </span>
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">Name of person requesting data export</label>
                    <input
                      type="text"
                      name="namePerson"
                      required={true}
                      className="project-modal-right"
                      placeholder="Your name"
                      ref={namePersonRef}
                    />
                  </span>
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">Email address</label>
                    <input
                      type="text"
                      name="email"
                      required={true}
                      className="project-modal-right"
                      placeholder="Your email address"
                      ref={emailRef}
                    />
                  </span>
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">Affiliation</label>
                    <input
                      type="text"
                      name="affiliation"
                      required={true}
                      className="project-modal-right"
                      placeholder="Your affiliation"
                      ref={affiliationRef}
                    />
                  </span>
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">SANE collaborative organisation</label>
                    <input
                      type="text"
                      name="affiliation"
                      className="project-modal-right"
                      placeholder="ID of your SANE collaborative organisation (if you have this)"
                      ref={collaborativeOrganisationRef}
                    />
                  </span>
                  <span className="bg__new-project-wrapper">
                    <label className="label project-modal-left">Description of project/plans</label>
                    <textarea
                      name="description"
                      required={true}
                      className="project-modal-right"
                      placeholder="A description of your project, in particular what analysis you plan to do and what results you want"
                      ref={descRef}
                    />
                  </span>
              </div>
              <div className="actions">
                {cancelButton}
                <input type="submit" className="btn primary add" value={submitButton} />
              </div>
            </form>
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
