import React from "react";
import { createRoot } from "react-dom/client";
import WorkspaceProjectsRecipe from "./WorkspaceProjectsRecipe";
//CSS must be included in the entry point to allow Webpack
// to detect and run CSS .

export function renderWorkspace(
  recipe,
  params,
  user,
  elementId,
  clientId = null,
) {
  console.debug("Rendering workspace via labo-workspace-components");
  const component = (
    <WorkspaceProjectsRecipe
      recipe={recipe}
      params={params}
      user={user}
      clientId={clientId}
    />
  );

  // render the component
  if (component) {
    const root = createRoot(document.getElementById(elementId));
    root.render(component);
  }
}
