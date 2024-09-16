import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import SessionStorageHandler from "../../../util/SessionStorageHandler";
import FlexRouter from "../../../util/FlexRouter";
import LocalStorageHandler from "../../../util/LocalStorageHandler";
import ProjectQueriesTable from "./ProjectQueriesTable";
import ProjectViewWrapper from "../ProjectViewWrapper";
import "./ProjectQueriesView.scss";

// the ProjectQueriesView is wrapped in a ProjectViewWrapper and returned to the Router
const WrappedProjectQueriesView = ({ clientId, user, params, recipe }) => {
  return (
    <ProjectViewWrapper
      renderComponent={ProjectQueriesView}
      clientId={clientId}
      user={user}
      params={params}
      recipe={recipe}
    />
  );
};

WrappedProjectQueriesView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

const WORKSPACE_TAB_ID = "bg__project-tab";
const WORKSPACE_QUERIES_TAB_ID = "queries";

const ProjectQueriesView = ({
  clientId, // eslint-disable-line no-unused-vars
  user,
  params, // eslint-disable-line no-unused-vars
  recipe, // eslint-disable-line no-unused-vars
  project,
  loadBookmarkCount, // eslint-disable-line no-unused-vars
  updateQueriesCount,
}) => {
  const [selectedQueries, setSelectedQueries] = useState([]); // eslint-disable-line no-unused-vars

  // React hook
  useEffect(() => {
    // store tab to sessionStorage
    SessionStorageHandler.set(WORKSPACE_TAB_ID, WORKSPACE_QUERIES_TAB_ID);

    return () => console.log("End of ProjectQueriesView lifecycle");
  }, []);

  const onChange = () => {
    setSelectedQueries([]);
    updateQueriesCount();
  };

  const compareQueries = (tableSelection) => {
    LocalStorageHandler.storeQueries(
      project,
      tableSelection.map((nq) => nq.id),
    );
    FlexRouter.gotoQueryComparisonTool();
  };

  // rendery everything
  return (
    <div className={IDUtil.cssClassName("project-queries-view")}>
      <ProjectQueriesTable
        key={project.id + 1}
        onChange={onChange}
        handleCompareLink={compareQueries}
        project={project}
        user={user}
      />
    </div>
  );
};

ProjectQueriesView.propTypes = {
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    description: PropTypes.string,
    created: PropTypes.string,
  }),
  loadBookmarkCount: PropTypes.func,
  updateQueriesCount: PropTypes.func,
};

export default WrappedProjectQueriesView;
