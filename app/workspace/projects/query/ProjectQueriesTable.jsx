import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "react-tooltip";
import Project from "../../../model/Project";
import IDUtil from "../../../util/IDUtil";
import CollectionUtil from "../../../util/CollectionUtil";
import QueryUtil from "../../../util/QueryUtil";
import FlexRouter from "../../../util/FlexRouter";
import SortTable from "../../SortTable";
import CopyToClipboard from "../../../helpers/CopyToClipboard";
import MessageHelper from "../../../helpers/MessageHelper";
import LocalStorageHandler from "../../../util/LocalStorageHandler";
import ComponentUtil from "../../../util/ComponentUtil";
import "./ProjectQueriesTable.scss";

class ProjectQueriesTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      queries: [],
      selectedQueries: this.props.selection ? this.props.selection : [],
      filter: {
        keywords: "",
        currentUser: false,
      },
    };
    PropTypes.checkPropTypes(
      ProjectQueriesTable.propTypes,
      this.props,
      "prop",
      this.constructor.name
    );
  }

  componentDidMount() {
    this.loadTableData(this.props.project);
    if (this.props.project) {
      LocalStorageHandler.storeJSONInLocalStorage(
        "stored-active-project",
        this.props.project
      );
    }
  }

  componentDidUpdate() {
    if (this.lastFilter !== this.state.filter) {
      this.lastFilter = this.state.filter;
      this.loadTableData(this.props.project);
    }
  }

  //whenever the keywords change
  keywordsChange = (e) =>
    this.setState({
      filter: Object.assign({}, this.state.filter, {
        keywords: e.target.value,
      }),
    });

  onChange = () => (this.props.onChange ? this.props.onChange() : false);

  //load the query data and apply the current filter
  loadTableData = (project) =>
    this.setState(
      {
        queries: this.filterQueries(
          project && project.queries ? project.queries : [],
          this.state.filter
        ),
      },
      () => this.onChange()
    );

  //Filter query list by given filter
  filterQueries(namedQueries, filter) {
    // filter on keywords in name or tool
    if (filter.keywords) {
      filter.keywords.split(" ").forEach((k) => {
        //FIXME this seems wrong, the filter will only apply the last keyword filter...
        namedQueries = namedQueries.filter((query) =>
          query.name.toLowerCase().includes(k.toLowerCase())
        );
      });
    }

    //generate a collectionConfig and assign it to each named query (FIXME this)
    namedQueries.forEach((nq) => {
      if (
        nq.query.collectionId &&
        nq.query.dateRange &&
        nq.query.dateRange.field
      ) {
        CollectionUtil.generateCollectionConfig(
          this.props.user.id, //FIXME this should be the client ID! (will break for personal collection queries only)
          this.props.user,
          nq.query.collectionId,
          (config) => (nq.collectionConfig = config), //assign the config to the named query
          true
        );
      }
    });

    return namedQueries;
  }

  viewQuery = (namedQuery) => {
    if (!namedQuery) return;
    const selectedQuery = this.state.queries.filter(
      (nq) => nq.name === namedQuery.name
    );
    if (selectedQuery.length > 0) {
      FlexRouter.gotoSingleSearch(selectedQuery[0].id);
    }
  };

  deleteQueries = (namedQueries) => {
    const msg =
      namedQueries.length > 1
        ? "Are you sure you want to delete " + namedQueries.length + " queries?"
        : "Are you sure you want to delete query: " +
          namedQueries[0].name +
          "?";
    if (ComponentUtil.userConfirm(msg)) {
      this.deleteProjectQueries(
        this.props.user.id,
        this.props.project,
        namedQueries
      );
    }
  };

  //separated the API, so it can be mocked for the unit-test
  deleteProjectQueries = (userId, project, queriesToDelete) => {
    project.queries = project.queries.filter((nq) => {
      return !queriesToDelete.map((nq1) => nq1.id).includes(nq.id);
    });
    QueryUtil.deleteQueries(
      queriesToDelete,
      userId,
      project.id,
      (queriesDeleted) => {
        if (queriesDeleted) {
          LocalStorageHandler.updateStoredQueries(project, queriesToDelete); //update the stored queries
          LocalStorageHandler.storeJSONInLocalStorage(
            "stored-active-project",
            project.toLocalStorageObject()
          ); //update the stored project
          this.loadTableData(project); //reload the table
          this.props.handleDeleteQueries
            ? this.props.handleDeleteQueries()
            : null; //optional callback
        } else {
          alert("An error occurred while deleting these queries");
        }
      }
    );
  };

  onSelectQuery = (item) => this.setState({ selectedQueries: item });

  sortQueries = (queries, sort) =>
    queries.sort(function (a, b) {
      const textA = a.name.toUpperCase();
      const textB = b.name.toUpperCase();
      if (sort.order === "asc") {
        return textA < textB ? -1 : textA > textB ? 1 : 0;
      } else {
        return textA > textB ? -1 : textA < textB ? 1 : 0;
      }
    });

  render() {
    const bulkActions = this.props.handleCompareLink
      ? [
          {
            title: "Delete",
            onApply: () => this.deleteQueries(this.state.selectedQueries),
          },
          {
            title: "Compare",
            onApply: () =>
              this.props.handleCompareLink(this.state.selectedQueries),
          },
        ]
      : [
          {
            title: "Delete",
            onApply: () => this.deleteQueries(this.state.selectedQueries),
          },
        ];
    return (
      <div className={IDUtil.cssClassName("project-queries-table")}>
        <div className="tools">
          <div className="left">
            <h3>Filters</h3>
            <div className="filter-container">
              <input
                className="search"
                type="text"
                placeholder="Search"
                value={this.state.filter.keywords}
                onChange={this.keywordsChange}
              />
            </div>
          </div>
        </div>

        <SortTable
          items={this.state.queries}
          head={[
            { field: "name", content: "Name", sortable: true },
            { field: "query", content: "Query", sortable: true },
            { field: "", content: "", sortable: false },
            { field: "", content: "", sortable: false },
          ]}
          row={(namedQuery) => [
            //must be a proper named query (Project.queries)
            {
              props: { className: "primary" },
              content: (
                <a onClick={this.viewQuery.bind(this, namedQuery)}>
                  {namedQuery.name}
                </a>
              ),
            },
            {
              content: (
                <div>
                  <a data-tooltip-id={"__qtt__" + namedQuery.id}>
                    <CopyToClipboard
                      textToSave={namedQuery.query.queryDetailsToClipboard(
                        namedQuery.name
                      )}
                    />
                  </a>
                  <Tooltip
                    id={"__qtt__" + namedQuery.id}
                    content={() =>
                      MessageHelper.renderQueryForTooltip(
                        namedQuery.query,
                        namedQuery.collectionConfig
                      )
                    }
                    clickable={true}
                    className="bg__custom-queryTooltip"
                  />
                  <span className="bg__searchTerm">
                    {namedQuery.query.toHumanReadableString()}
                  </span>
                </div>
              ),
            },
            {
              content: (
                <a
                  className="btn blank warning"
                  onClick={() => this.deleteQueries([namedQuery])}
                >
                  Delete
                </a>
              ),
            },
            {
              content: (
                <a
                  onClick={this.viewQuery.bind(this, namedQuery)}
                  className="btn"
                >
                  Open
                </a>
              ),
            },
          ]}
          onSelectQuery={this.onSelectQuery}
          onSort={this.sortQueries}
          loading={this.state.loading}
          bulkActions={bulkActions}
          defaultSort={{
            field: "name",
            order: "asc",
          }}
          selection={this.state.selectedQueries}
          keepSelectionWhenDone={this.props.keepSelectionWhenDone}
        />
      </div>
    );
  }
}

ProjectQueriesTable.propTypes = {
  project: Project.getPropTypes(true),
  user: PropTypes.shape({
    // current user object used for defining access roles per project
    id: PropTypes.string.isRequired,
  }).isRequired,
  handleCompareLink: PropTypes.func, // only passed via the QueryComparisonRecipe
  handleDeleteQueries: PropTypes.func, // only passed via the QueryComparisonRecipe
  onChange: PropTypes.func, // whenever something is deleted pass it on to the owner, so they can adapt (e.g. displaying query counts)
  selection: PropTypes.array,
  keepSelectionWhenDone: PropTypes.bool, //whether to keep selections when done
};

export default ProjectQueriesTable;
