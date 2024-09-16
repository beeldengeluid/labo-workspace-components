import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

import ProjectAPI from "../../../api/ProjectAPI";
import IDUtil from "../../../util/IDUtil";
import trunc from "../../../util/Trunc";
import ProjectUtil from "../../../util/ProjectUtil";
import LocalStorageHandler from "../../../util/LocalStorageHandler";
import { exportDataAsJSON } from "../../helpers/Export";
import SortTable from "../../SortTable";
import "./ProjectTable.scss";

/**
 * Table that shows all the projects. It handles the loading and filtering of the projects data.
 */
class ProjectTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.head = [
      { field: "name", content: "Name", sortable: true },
      { field: "description", content: "Description", sortable: true },
      { field: "owner", content: "Owner", sortable: true },
      { field: "access", content: "Access", sortable: true },
      { field: "created", content: "Created", sortable: true },
      { field: "", content: "", sortable: false },
    ];

    this.bulkActions = [
      { title: "Delete", onApply: this.deleteProjects },
      { title: "Export", onApply: exportDataAsJSON },
    ];

    this.defaultSort = {
      field: "name",
      order: "asc",
    };

    this.state = {
      projects: [], //prettified projects that are visible in the ui
      rawProjects: [], //all unfiltered projects of instance Project
      loading: true,
      filter: {
        keywords: "",
        currentUser: false,
      },
    };

    this.requestedBookmark = {};

    this.requestDataTimeout = -1;
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate() {
    if (this.lastFilter !== this.state.filter) {
      this.lastFilter = this.state.filter;

      // throttle data requests
      clearTimeout(this.requestDataTimeout);
      this.requestDataTimeout = setTimeout(this.loadData, 500);
    }
  }

  //load the projects from the Workspace API
  loadData = () => {
    ProjectAPI.list(this.props.user.id, this.state.filter, this.setProjects);
  };

  setProjects = (projects) => {
    // decorate the projects
    let uiProjects = this.toUIData(projects || []);

    // we filter the results now on client side
    uiProjects = this.filterProjects(uiProjects || []);

    this.setState({
      projects: uiProjects, // will be displayed in the table
      rawProjects: projects, // needed for the ProjectMigrationForm
      loading: false,
    });
  };

  //filter projects (client side) TODO: server side filtering
  filterProjects = (projects) => {
    const userId = this.props.user.id;
    let result = projects.filter((project) => project.getAccess(userId));
    const filter = this.state.filter;

    // filter on keywords
    if (filter.keywords) {
      const keywords = filter.keywords.split(" ");
      keywords.forEach((k) => {
        k = k.toLowerCase();
        result = result.filter(
          (project) =>
            (project.name && project.name.toLowerCase().includes(k)) ||
            (project.description &&
              project.description.toLowerCase().includes(k)),
        );
      });
    }

    // filter on current user
    if (filter.currentUser) {
      result = result.filter((project) => project.owner.id === userId);
    }

    return result;
  };

  //convert the api data to client side data;
  toUIData = (projects) => {
    return projects.map((p) => {
      p.getBookmarkCount = function () {
        return this.bookmarks.length;
      };
      p.getAccess = function () {
        return "Admin";
      };
      p.getCollaboratorCount = function () {
        return this.collaborators.length;
      };
      p.canDelete = function () {
        return true;
      };
      p.canExport = function () {
        return true;
      };
      p.canOpen = function () {
        return true;
      };
      p.bookmarks = [];
      p.collaborators = [];
      p.owner = {
        id: this.props.user.id,
        name: this.props.user.name,
      };
      return p;
    });
  };

  //triggered upon using the filter field
  keywordsChange = (e) => {
    this.setState({
      filter: Object.assign({}, this.state.filter, {
        keywords: e.target.value,
      }),
    });
  };

  deleteProjects = (projects) => {
    ProjectUtil.deleteProjects(projects, this.props.user.id, this.loadData);
  };

  sortProjects = (projects, sort) => {
    const getLowerSafe = (s) => (s ? s.toLowerCase() : "");
    // const getFirst = (l) => Array.isArray(l) && l[0] ? l[0].toLowerCase() : "";

    const sorted = projects;
    switch (sort.field) {
      case "name":
        sorted.sort((a, b) =>
          getLowerSafe(a.name) > getLowerSafe(b.name) ? 1 : -1,
        );
        break;
      case "description":
        sorted.sort((a, b) =>
          getLowerSafe(a.description) > getLowerSafe(b.description) ? -1 : 1,
        );
        break;
      case "owner":
        sorted.sort((a, b) =>
          getLowerSafe(a.owner.name) > getLowerSafe(b.owner.name) ? 1 : -1,
        );
        break;
      case "access":
        sorted.sort((a, b) =>
          a.getAccess(this.props.user.id) > b.getAccess(this.props.user.id)
            ? 1
            : -1,
        );
        break;
      case "created":
        sorted.sort((a, b) => (a.created > b.created ? 1 : -1));
        break;
      // case 'collaborators': sorted.sort((a, b) => getFirst(a.collaborators) > getFirst(b.collaborators) ? 1 : -1) ; break;
      default:
        return sorted;
    }
    return sort.order === "desc" ? sorted.reverse() : sorted;
  };

  setActiveProject = (project) => {
    LocalStorageHandler.storeJSONInLocalStorage(
      "stored-active-project",
      project,
    );
  };

  //Transforms a project to a row needed for the sort table
  //don't like this is passed as a function to the sort table... but let's see first
  getProjectRow = (project) => {
    const currentUserId = this.props.user.id;

    return [
      {
        props: { className: "primary" },
        content: (
          <Link
            onClick={() => this.setActiveProject(project)}
            to={"/workspace/projects/" + project.id}
          >
            {project.name}
          </Link>
        ),
      },
      {
        props: { className: "description" },
        content: (
          <p>
            <Link
              onClick={() => this.setActiveProject(project)}
              to={"/workspace/projects/" + project.id + "/details"}
            >
              {trunc(project.description, 140)}
            </Link>
          </p>
        ),
      },
      {
        content: (
          <span>
            {project.owner.name}{" "}
            {project.getCollaboratorCount() ? (
              <span className="collaborators">
                {project.getCollaboratorCount()} Collaborator
                {project.getCollaboratorCount() !== 1 ? "s" : ""}
              </span>
            ) : (
              ""
            )}
          </span>
        ),
      },
      {
        props: { className: "access smaller" },
        content: project.getAccess(currentUserId),
      },
      {
        props: { className: "smaller" },
        content: project.created.substring(0, 10),
      },

      {
        props: { className: "actions" },
        content: project.canOpen(currentUserId) ? (
          <div>
            <Link
              onClick={() => this.setActiveProject(project)}
              to={"/workspace/projects/" + project.id}
              className="btn"
            >
              Open
            </Link>

            <div className="row-menu">
              <span>⋮</span>
              <ul>
                <li
                  onClick={() =>
                    ProjectUtil.deleteProjects(
                      [project],
                      this.props.user.id,
                      this.loadData,
                    )
                  }
                >
                  Delete
                </li>
                <li onClick={() => exportDataAsJSON(project)}>Export</li>
              </ul>
            </div>
          </div>
        ) : (
          ""
        ),
      },
    ];
  };

  render() {
    return (
      <div className={IDUtil.cssClassName("project-table")}>
        <div className="tools">
          <div className="left">
            <h3>Filters</h3>
            <div className="filter-container">
              <input
                className="search"
                type="text"
                placeholder="Search User Projects"
                value={this.state.filter.keywords}
                onChange={this.keywordsChange}
              />
            </div>
          </div>
        </div>
        <div id="project-migration-modal" />
        <SortTable
          items={this.state.projects}
          head={this.head}
          row={this.getProjectRow}
          onSort={this.sortProjects}
          loading={this.state.loading}
          bulkActions={this.bulkActions}
          defaultSort={this.defaultSort}
        />
      </div>
    );
  }
}

ProjectTable.propTypes = {
  // current user object used for defining access roles per project
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProjectTable;
