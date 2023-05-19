import React, { useRef } from "react";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import Project from "../../../model/Project";
import { Link } from "react-router-dom";
import ProjectAPI from "../../../api/ProjectAPI";
import './ProjectForm.scss';

/**
 * Shows the project form and handles saving the project data.
 */
const ProjectForm = ({
  id, // eslint-disable-line no-unused-vars
  cancelLink,
  onCancel,
  project,
  projectDidSave,
  submitButton,
  user,
}) => {
  const nameRef = useRef(null);
  const descRef = useRef(null);

  const handleSubmit = (e, proj) => {
    e.preventDefault();

    const p = Project.construct(proj);
    p.name = nameRef.current?.value;
    p.description = descRef.current?.value;
    saveProject(p, user.id);

    return false;
  };

  const saveProject = (proj, userId) => {
    ProjectAPI.save(userId, proj, (p) => {
      if (p && p.id) {
        projectDidSave(p.id);
      } else {
        alert("An error occurred while saving this project");
      }
    });
  };

  // rendering
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

  return (
    <form
      className={IDUtil.cssClassName("project-form")}
      onSubmit={(e) => handleSubmit(e, project)}
    >
      <div className="new-project-container">
        <span className="bg__new-project-wrapper">
          <label className="label project-modal-left">Name</label>
          <input
            type="text"
            name="name"
            required={true}
            className="project-modal-right"
            defaultValue={project.name}
            ref={nameRef}
          />
        </span>
        <span className="bg__new-project-wrapper">
          <label className="label project-modal-left">Description</label>
          <textarea
            name="description"
            className="project-modal-right"
            defaultValue={project.description}
            ref={descRef}
          />
        </span>
      </div>

      <div className="actions">
        {cancelButton}
        <input type="submit" className="btn primary add" value={submitButton} />
      </div>
    </form>
  );
};

ProjectForm.propTypes = {
  id: PropTypes.string,
  cancelLink: PropTypes.string,
  onCancel: PropTypes.func,
  project: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    user: PropTypes.string,
  }),
  projectDidSave: PropTypes.func,
  submitButton: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }),
};

export default ProjectForm;
