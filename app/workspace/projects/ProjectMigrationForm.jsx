import React from "react";
import PropTypes from "prop-types";

import Project from "../../../model/Project";

import IDUtil from "../../../util/IDUtil";

import ProjectList from "./ProjectList";

export default class ProjectMigrationForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProject: null,
      options: this.props.projectDataTypes,
      selectedOptions: [],
      selectedAction: "move",
      validationError: false,
    };
  }

  selectProject = (project) => {
    this.setState({ selectedProject: project });
  };

  onSelectProjectData = (e) => {
    const options = this.state.options;
    const selectedOptions = this.state.selectedOptions;
    if (options.includes(e.target.value)) {
      options.splice(options.indexOf(e.target.value), 1);
      selectedOptions.unshift(e.target.value);
    } else {
      options.unshift(e.target.value);
      selectedOptions.splice(selectedOptions.indexOf(e.target.value), 1);
    }

    this.setState({ options: options, selectedOptions: selectedOptions });
  };

  setAction = (e) => {
    this.setState({ selectedAction: e.target.value });
  };

  processProjectData = (
    action,
    user,
    sourceProject,
    targetProject,
    selectedOptions
  ) => {
    if (!targetProject || selectedOptions.length === 0) {
      this.setState({ validationError: true });
    } else {
      this.props.onMigrate(
        action,
        user,
        sourceProject,
        targetProject,
        selectedOptions
      );
    }
  };

  /* -------------------- rendering functions -------------------- */

  renderValidationFailed = (action) => {
    return (
      <div className="validation-error">
        Please select a project and at least one piece of project data to{" "}
        <strong>{action}</strong>
      </div>
    );
  };

  renderItem = (item, index, selected) => (
    <option
      key={index}
      className={selected ? "right" : "left"}
      onClick={this.onSelectProjectData}
      value={item}
    >
      {item}
    </option>
  );

  renderSelector = (options, selected) => {
    return (
      <div className="multi-select">
        <select multiple>
          {options.map((item, index) => this.renderItem(item, index, false))}
        </select>
        <select multiple>
          {selected.map((item, index) => this.renderItem(item, index, true))}
        </select>
      </div>
    );
  };

  render() {
    return (
      <div className={IDUtil.cssClassName("project-migration-form")}>
        <div className="project-actions">
          You are about to
          <select onChange={this.setAction}>
            <option value="move">Move</option>
            <option value="copy">Copy</option>
          </select>
          your project data from project:{" "}
          <strong>{this.props.project.name}</strong>&nbsp;to project:
          <ProjectList
            buttonText="Select target project"
            activeProject={this.state.selectedProject}
            onSelect={this.selectProject}
            projects={this.props.userProjects}
            user={this.props.user}
            projectIcon={false}
          />
        </div>
        <br />
        Select the project data you&apos;d like to{" "}
        <strong>{this.state.selectedAction}</strong>
        {this.renderSelector(this.state.options, this.state.selectedOptions)}
        {this.state.validationError && this.renderValidationFailed()}
        <button
          className="btn btn-primary"
          onClick={() =>
            this.processProjectData(
              this.state.selectedAction,
              this.props.user,
              this.props.project,
              this.state.selectedProject,
              this.state.selectedOptions
            )
          }
        >
          {this.state.selectedAction}
        </button>
      </div>
    );
  }
}

ProjectMigrationForm.propTypes = {
  project: Project.getPropTypes(true),
  projectDataTypes: PropTypes.array.isRequired,
  userProjects: PropTypes.array.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string,
  }).isRequired,
  onMigrate: PropTypes.func.isRequired,
};
