import { createRoot } from "react-dom/client";
import React from "react";
import ProjectAPI from "../api/ProjectAPI";

export default class ProjectUtil {
  static DataTypes = Object.freeze({
    QUERIES: Symbol("Queries"),
    BOOKMARKS: Symbol("Bookmarks"),
    ANNOTATIONS: Symbol("Annotations"),
    SESSIONS: Symbol("Sessions"),
  });

  static deleteProjects = (projects, userId, onCompletion = null) => {
    if (!projects || !userId) return null;
    const msg =
      projects.length > 1
        ? "Are you sure you want to delete " + projects.length + " projects?"
        : "Are you sure you want to delete project " + projects[0].name;

    if (window.confirm(msg)) {
      let calls = projects.length;
      projects.forEach((project) => {
        ProjectAPI.delete(userId, project.id, (status) => {
          calls--;
          console.debug("Project deleted ok: " + project.id, status);
          if (calls === 0 && typeof onCompletion === "function") {
            onCompletion();
          }
        });
      });
    }
  };

}
