import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, useLocation } from "react-router-dom";

import SessionStorageHandler from "../../util/SessionStorageHandler";
import ProjectAPI from "../../api/ProjectAPI";
import AnnotationAPI from "../../api/AnnotationAPI";

import IDUtil from "../../util/IDUtil";
import { setBreadCrumbsFromMatch } from "../helpers/BreadCrumbs";
import "./ProjectViewWrapper.scss";

/**
 * Wrapper for pages within a single project. It provides a submenu that gives
 * access to all the subpages (Bookmarks/Sessions/Details)
 * It also provides the project data to the subviews.
 */

// session storage keys
const KEYS = {
  bookmarkCount: "bg__project-bookmarks-count",
  annotationCount: "bg__project-annotation-count",
};

const ProjectViewWrapper = ({
  renderComponent,
  clientId,
  user,
  params,
  recipe,
}) => {
  // routing params
  const { projectId } = useParams();
  const location = useLocation();

  // state variables
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [bookmarkCount, setBookmarkCount] = useState(
    SessionStorageHandler.get(KEYS.bookmarkCount, 0),
  );
  const [annotationCount, setAnnotationCount] = useState(
    SessionStorageHandler.get(KEYS.annotationCount, 0),
  );
  const [queriesCount, setQueriesCount] = useState(0);

  // React hook
  useEffect(() => {
    loadProject(user.id, projectId);
  }, [projectId, user.id]);

  // load project based user.id and the url param :projectId
  const loadProject = (userId, projId) => {
    ProjectAPI.get(userId, projId, (p) => {
      if (p) {
        // inject project name to breadcrumbs
        const titles = {};
        titles[p.id] = p.name;
        setBreadCrumbsFromMatch(location.pathname, titles);

        // set to state
        setLoading(false);
        setProject(p);
        setQueriesCount(p.queries.length);
        loadBookmarkCount(userId, p);
      } else {
        setLoading(false);
      }
    });
  };

  const loadBookmarkCount = (userId, proj) => {
    if (!proj) {
      proj = project;
    }
    if (!userId) {
      userId = user.id;
    }
    AnnotationAPI.getAnnotationCounts(userId, proj.id, (counts) => {
      if (counts) {
        SessionStorageHandler.set(KEYS.bookmarkCount, counts.bookmarkCount);
        SessionStorageHandler.set(KEYS.annotationCount, counts.annotationCount);
        setBookmarkCount(counts.bookmarkCount);
        setAnnotationCount(counts.annotationCount);
      } else {
        SessionStorageHandler.set(KEYS.bookmarkCount, 0);
        SessionStorageHandler.set(KEYS.annotationCount, 0);
        setBookmarkCount(0);
        setAnnotationCount(0);
      }
    });
  };

  const updateQueriesCount = () => {
    setQueriesCount(project.queries.length);
  };

  const isTabActive = (tabName) => {
    return location && location.pathname
      ? location.pathname.indexOf(tabName) != -1
      : false;
  };

  // The actual rendering part
  const RenderComponent = renderComponent;
  let contents = null;

  if (loading) {
    contents = <h3 className="loading">Loading...</h3>;
  } else if (project) {
    contents = (
      <div>
        <div className="project-header">
          <div className="info-bar">
            <h2>{project.name || "Unnamed project"}</h2>
            <p>{project.description}</p>
          </div>

          <div className="submenu">
            <a
              className={isTabActive("details") ? "active" : null}
              href={
                "/workspace/projects/" +
                encodeURIComponent(project.id) +
                "/details"
              }
            >
              Details
            </a>
            <a
              className={isTabActive("bookmarks") ? "active" : null}
              href={
                "/workspace/projects/" +
                encodeURIComponent(project.id) +
                "/bookmarks"
              }
            >
              Bookmarks<span className="count">{bookmarkCount || 0}</span>
            </a>
            <a
              className={isTabActive("annotations") ? "active" : null}
              href={
                "/workspace/projects/" +
                encodeURIComponent(project.id) +
                "/annotations"
              }
            >
              Annotations<span className="count">{annotationCount || 0}</span>
            </a>
            <a
              className={isTabActive("queries") ? "active" : null}
              href={
                "/workspace/projects/" +
                encodeURIComponent(project.id) +
                "/queries"
              }
            >
              Queries
              <span className="count">{queriesCount ? queriesCount : 0}</span>
            </a>
          </div>
        </div>

        <div className="component">
          <RenderComponent
            clientId={clientId}
            user={user}
            params={params}
            recipe={recipe}
            project={project}
            loadBookmarkCount={loadBookmarkCount}
            updateQueriesCount={updateQueriesCount}
          />
        </div>
      </div>
    );
  } else {
    contents = <h3 className="error">Project could not be found</h3>;
  }

  return (
    <div className={IDUtil.cssClassName("project-view-wrapper")}>
      {contents}
    </div>
  );
};

ProjectViewWrapper.propTypes = {
  renderComponent: PropTypes.elementType,
  clientId: PropTypes.string,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
  recipe: PropTypes.object,
  params: PropTypes.object,
};

export default ProjectViewWrapper;
