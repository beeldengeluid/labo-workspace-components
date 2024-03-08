import QueryAPI from "../api/QueryAPI";

export default class QueryUtil {
  static deleteQueries = (queries, userId, projectId, callback) => {
    if (!queries || !userId || !projectId) return null;

    let calls = queries.length;
    queries.forEach((query) => {
      QueryAPI.delete(query.id, userId, projectId, (status) => {
        calls--;
        if (status == null) {
          //if something has gone wrong, callback straightaway
          callback(status);
        }
        if (calls === 0) {
          //otherwise call back once all are done
          callback(status);
        }
      });
    });
  };

  static shareQuery = (query, userId, projectId, callback) => {
    if (!query || !userId || !projectId) return null;

    QueryAPI.query_operation(query.id, userId, projectId, "share", (status) => {
      callback(status);
    });
  };
}
