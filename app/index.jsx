import React from "react";
import { createRoot } from "react-dom/client";
import WorkspaceProjectsRecipe from "./WorkspaceProjectsRecipe";

import "../sass/labo-workspace-components.scss";
//CSS must be included in the entry point to allow Webpack
// to detect and run CSS .

export function cookRecipe(recipe, params, user, elementId, clientId = null) {
  let component = null;

  switch (recipe.type) { // TODO remove the recipe.type
    case "workspace-projects":
      component = (
        <WorkspaceProjectsRecipe
          recipe={recipe}
          params={params}
          user={user}
          clientId={clientId}
        />
      );
      break;

    default:
      console.log(recipe);
      console.error("Please provide a valid recipe");
      return;
  }

  // render the component
  if (component) {
    const root = createRoot(document.getElementById(elementId)); // createRoot(container!) if you use TypeScript
    root.render(component);
  }
}
