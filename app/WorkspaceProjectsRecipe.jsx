import React from "react";
import PropTypes from "prop-types";
import { Routes, BrowserRouter, Route, Navigate } from "react-router-dom";

import SessionStorageHandler from "./util/SessionStorageHandler";

//bookmark and annotation view
import ProjectBookmarkView from "./workspace/projects/bookmark/ProjectBookmarkView";
import ProjectAnnotationView from "./workspace/projects/annotation/ProjectAnnotationView";

//basic crud views
import ProjectListView from "./workspace/projects/crud/ProjectListView";
import ProjectCreateView from "./workspace/projects/crud/ProjectCreateView";
import ProjectDetailsView from "./workspace/projects/crud/ProjectDetailsView";
import ProjectEditView from "./workspace/projects/crud/ProjectEditView";

//queries view
import ProjectQueriesView from "./workspace/projects/query/ProjectQueriesView";

const WORKSPACE_TAB_ID = "bg__project-tab";
const WORKSPACE_PROJECT_DETAILS_TAB_ID = "details";

const WorkspaceProjectsRecipe = ({ recipe, params, user, clientId }) => {
  const getRouteElement = (RenderComponent) => {
    return (
      <RenderComponent
        recipe={recipe}
        params={params}
        user={user}
        clientId={clientId}
      />
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/workspace/projects"
          element={getRouteElement(ProjectListView)}
        />
        <Route
          path="/workspace/projects/create"
          element={getRouteElement(ProjectCreateView)}
        />

        <Route
          path="/workspace/projects/:projectId"
          element={
            <Navigate
              to={SessionStorageHandler.get(
                WORKSPACE_TAB_ID,
                WORKSPACE_PROJECT_DETAILS_TAB_ID
              )}
            />
          }
        />

        <Route
          path="/workspace/projects/:projectId/bookmarks"
          element={getRouteElement(ProjectBookmarkView)}
        />
        <Route
          path="/workspace/projects/:projectId/annotations"
          element={getRouteElement(ProjectAnnotationView)}
        />
        <Route
          path="/workspace/projects/:projectId/queries"
          element={getRouteElement(ProjectQueriesView)}
        />
        <Route
          path="/workspace/projects/:projectId/details"
          element={getRouteElement(ProjectDetailsView)}
        />
        <Route
          path="/workspace/projects/:projectId/edit"
          element={getRouteElement(ProjectEditView)}
        />
      </Routes>
    </BrowserRouter>
  );
};

WorkspaceProjectsRecipe.propTypes = {
  clientId: PropTypes.string,

  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    attributes: PropTypes.shape({
      allowPersonalCollections: PropTypes.bool,
    }),
  }),

  params: PropTypes.shape({
    queryId: PropTypes.string,
  }).isRequired,

  recipe: PropTypes.shape({
    description: PropTypes.string,
    id: PropTypes.string,
    inRecipeList: PropTypes.bool,
    name: PropTypes.string.isRequired, // Use for when rendering header (isRequired by <ToolHeader/>)
    phase: PropTypes.string,
    recipeDescription: PropTypes.string,
    type: PropTypes.string,
    url: PropTypes.string,
    ingredients: PropTypes.shape({}).isRequired,
  }).isRequired,
};

export default WorkspaceProjectsRecipe;
