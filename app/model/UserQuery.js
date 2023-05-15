import PropTypes from "prop-types";
import Query from "../model/Query";

export default class UserQuery {
  constructor(
    id,
    userId,
    collectionId,
    projectId,
    query,
    queryType,
    created,
    name,
    isShared
  ) {
    this.id = id;
    this.userId = userId;
    this.collectionId = collectionId;
    this.projectId = projectId;
    this.query = query;
    this.queryType = queryType;
    this.created = created;
    this.name = name;
    this.isShared = isShared;
  }

  //this is the object being sent via the Query API (it filters out the collectionConfig)
  toServerObject = () => {
    const userQuery = {
      userId: this.userId,
      collectionId: this.collectionId,
      projectId: this.projectId,
      query: this.query,
      queryType: this.queryType,
      created: this.created,
      name: this.name,
      isShared: this.isShared,
    };
    if (this.id) {
      //only add the ID when it's there, so the API will use the correct request method
      userQuery.id = this.id;
    }
    return userQuery;
  };

  toLocalStorageObject = () => {
    return this.toServerObject();
  };

  static construct(data) {
    data = data || {};
    return new UserQuery(
      data.id || null,
      data.userId || null,
      data.collectionId || null,
      data.projectId || null,
      Query.construct(data.query, null, false) || null,
      data.queryType || null,
      data.created || null,
      data.name || null,
      data.isShared || null
    );
  }

  static constructFromQuery(query, userId, projectId, name) {
    return new UserQuery(
      null,
      userId,
      query.collectionId,
      projectId,
      Query.construct(query, null, false),
      "layered search",
      null,
      name,
      false // default is not to shar
    );
  }
  static getPropTypes(isRequired = true) {
    const userQueryShape = PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      userId: PropTypes.string,
      collectionId: PropTypes.string,
      projectId: PropTypes.string,
      query: PropTypes.object,
      queryType: PropTypes.string,
      created: PropTypes.string,
      isShared: PropTypes.bool,
    });
    return isRequired ? userQueryShape.isRequired : userQueryShape;
  }
}
