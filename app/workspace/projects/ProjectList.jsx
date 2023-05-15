import React from "react";
import PropTypes from "prop-types";
import Project from "../../../model/Project";
import ComponentUtil from "../../../util/ComponentUtil";
import IDUtil from "../../../util/IDUtil";
import ProjectForm from "./crud/ProjectForm";
import ProjectAPI from "../../../api/ProjectAPI";

/**
 * Returns the project list and send it to the output callback.
 *
 * FIXME this component does not handle new properties yet! (e.g. if you pass a new this.props.projects, the project list is NOT updated at all)
 */
export default class ProjectList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      allProjects: this.props.projects || [],
      visibleProjects: this.props.projects || [],
      showNewProjectForm: false,
    };
    this.filterField = React.createRef();
    this.CLASS_PREFIX = "prl";
  }

  onProjectSaved = (project) => {
    if (project) {
      const projects = [...this.state.allProjects, project];
      this.setState(
        {
          showNewProjectForm: false,
          allProjects: projects,
          visibleProjects: projects,
        },
        () => this.selectProject(project.id)
      );
    }
  };

  handleProjectClicked = (e) => {
    this.selectProject(e.target.id);
  };

  selectProject = (projectId) => {
    const selectedProject = this.state.allProjects.filter(
      (item) => item.id === projectId
    );
    this.props.onSelect(selectedProject[0]);
    if (this.filterField.current) {
      this.filterField.current.value = "";
      this.filterProjects();
    }
  };

  filterProjects = () => {
    const filteredProjects = this.state.allProjects.filter((item) =>
      item.name
        .toLowerCase()
        .includes(this.filterField.current.value.toLowerCase())
    );
    this.setState({
      visibleProjects: filteredProjects,
    });
  };

  newProject = () => {
    this.setState({
      showNewProjectForm: true,
    });
  };

  renderProjectForm = () => (
    <ProjectForm
      id="bg__project-selector"
      submitButton="save"
      onCancel={() => {
        ComponentUtil.hideModal(
          this,
          "showNewProjectForm",
          "project__modal",
          true
        );
      }}
      project={{
        name: "",
        description: "",
        user: this.props.user.id,
      }}
      projectDidSave={(projectId) => {
        ProjectAPI.get(this.props.user.id, projectId, (project) => {
          if (project && project.id) {
            this.onProjectSaved(project);
          }
        });
        ComponentUtil.hideModal(
          this,
          "showNewProjectForm",
          "project__modal",
          true
        );
      }}
      user={this.props.user}
    />
  );

  renderProjectsList = (modalOpened) => {
    // remove active project from list of available options
    const listItems = this.props.activeProject
      ? this.state.visibleProjects.filter(
          (item) => item.name !== this.props.activeProject.name
        )
      : this.state.visibleProjects;
    const menuClasses = [IDUtil.cssClassName("menu", this.CLASS_PREFIX)];
    if (modalOpened) {
      menuClasses.push("hidden");
    }

    // only show filter if there are more than N items (or something is typed in the filter)
    const showFilter =
      (this.filterField.current && this.filterField.current.value.length > 0) ||
      listItems.length > 8;

    return (
      <ul className={menuClasses.join(" ")}>
        {showFilter && (
          <input
            ref={this.filterField}
            type="text"
            onChange={this.filterProjects}
            placeholder="Filter projects"
            className={IDUtil.cssClassName("filter-list", this.CLASS_PREFIX)}
          />
        )}
        {listItems.map((item) => (
          <li id={item.id} key={item.id} onClick={this.handleProjectClicked}>
            {item.name}
          </li>
        ))}
        <button
          onClick={this.newProject}
          className={IDUtil.cssClassName("new", this.CLASS_PREFIX)}
        >
          {" "}
          + New Project
        </button>
      </ul>
    );
  };

  render() {
    const projectList = this.renderProjectsList(this.state.showNewProjectForm);
    const newProjectForm = this.state.showNewProjectForm
      ? this.renderProjectForm()
      : null;

    return (
      <label className={IDUtil.cssClassName("project-list")}>
        {this.props.activeProject && this.props.activeProject.name !== null ? (
          <div className="active-project">
            <div
              className={this.props.projectIcon ? "title with-icon" : "title"}
            >
              {this.props.activeProject.name}
            </div>
            <a href={"/workspace/projects/" + this.props.activeProject.id} />
          </div>
        ) : (
          <div className="select">{this.props.buttonText}</div>
        )}
        <input
          type="checkbox"
          className={IDUtil.cssClassName("checkbox", this.CLASS_PREFIX)}
        />
        {projectList}
        {newProjectForm}
      </label>
    );
  }
}
ProjectList.propTypes = {
  onSelect: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired,
  projects: PropTypes.array,
  activeProject: Project.getPropTypes(false),
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    attributes: PropTypes.shape({
      allowPersonalCollections: PropTypes.bool,
    }),
  }).isRequired,
  projectIcon: PropTypes.bool, //whether or not to show the project icon
};
