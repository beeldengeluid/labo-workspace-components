import PropTypes from "prop-types";
import Query from "./Query";

export default class Project {
  constructor(
    id,
    name,
    description,
    user,
    created,
    queries,
    author,
    research,
    reflection,
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.user = user;
    this.created = created;
    this.queries = queries; // array containing named queries
    this.author = author;
    this.research = research;
    this.reflection = reflection;
  }

  //this is the object being sent via the ProjectAPI (it filters out the collectionConfig and the queries)
  toServerObject = () => {
    const project = {
      name: this.name,
      description: this.description,
      user: this.user,
      created: this.created,
      queries: this.queries.map((nq) => {
        return { name: nq.name, query: nq.query };
      }),
      author: this.author,
      research: this.research,
      reflection: this.reflection,
    };
    if (this.id) {
      //only add the ID when it's there, so the API will use the correct request method
      project.id = this.id;
    }
    return project;
  };
  //local storage only filters out the collection config, as we want to store the queries
  toLocalStorageObject = () => {
    const project = {
      name: this.name,
      description: this.description,
      user: this.user,
      created: this.created,
      queries: this.queries.map((nq) => {
        return { name: nq.name, id: nq.id, query: nq.query };
      }),
      author: this.author,
      research: this.research,
      reflection: this.reflection,
    };
    if (this.id) {
      //only add the ID when it's there, so the API will use the correct request method
      project.id = this.id;
    }
    return project;
  };

  static construct(data) {
    data = data || {};
    const queries = data.queries || [];
    return new Project(
      data.id || null,
      data.name || null,
      data.description || null,
      data.user || null,
      data.created || null,
      queries.map((q) => {
        return {
          query: Query.construct(q.query), //make sure the queries are of type Query
          name: q.name,
          id: q.id,
          collectionConfig: null, // populated in the ProjectQueriesTable (FIXME should be nicer, but ok for now)
        };
      }),
      data.author || null,
      data.research || null,
      data.reflection || null,
    );
  }

  static getPropTypes(isRequired = true) {
    const projectShape = PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      description: PropTypes.string,
      user: PropTypes.string,
      created: PropTypes.string,
      queries: PropTypes.array,
      author: AuthorPropTypes,
      research: ResearchPropTypes,
      reflection: ReflectionPropTypes,
    });
    return isRequired ? projectShape.isRequired : projectShape;
  }
}

export const AuthorPropTypes = PropTypes.shape({
  background: PropTypes.string.isRequired,
});

export const ReflectionPropTypes = PropTypes.shape({
  enabled: PropTypes.bool.isRequired,
  questions: PropTypes.shape({
    bookmarkGroup: PropTypes.string.isRequired,
    resource: PropTypes.string.isRequired,
    mediaObject: PropTypes.string.isRequired,
    segmentLayer: PropTypes.string.isRequired,
    segment: PropTypes.string.isRequired,
  }).isRequired,
});

export const SubjectPropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  vocabulary: PropTypes.string.isRequired,
});

export const ResearchPropTypes = PropTypes.shape({
  context: PropTypes.string.isRequired,
  question: PropTypes.string.isRequired,
  subjects: PropTypes.arrayOf(SubjectPropTypes).isRequired,
  links: PropTypes.arrayOf(PropTypes.string).isRequired,
});
