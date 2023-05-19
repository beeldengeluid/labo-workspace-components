import React from "react";
import PropTypes from "prop-types";
import IDUtil from "../../../util/IDUtil";
import { BookmarkTranslator } from "../../helpers/BookmarkTranslator";
import classNames from "classnames";
import './AnnotationRow.scss'

/**
 * A row with annotation information and sub level bookmarks
 */
class AnnotationRow extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  // eslint-disable-next-line no-unused-vars
  toggleSub = (e) => this.props.toggleSub(this.props.annotation.annotationId);
  onView = (bookmark) => this.props.onView(bookmark);
  onSelectChange = (e) =>
    this.props.onSelect(this.props.annotation, e.target.checked);

  //Get a table row of info/metatdata for the given annotation
  //It renders different fields based on the annotationType
  getInfoRow(annotation) {
    switch (annotation.annotationType) {
      case "classification":
        return (
          <ul className="info annotation-classification">
            <li className="primary">
              <h4 className="label">Code</h4>
              <p>{annotation.label}</p>
            </li>
            <li className="vocabulary">
              <h4 className="label">Vocabulary</h4>
              <p>{annotation.vocabulary}</p>
            </li>

            <li className="created">
              <h4 className="label">Created</h4>
              <p>
                {annotation.created ? annotation.created.substring(0, 10) : "-"}
              </p>
            </li>
          </ul>
        );
      case "comment":
        return (
          <ul className="info annotation-comment">
            <li className="primary">
              <h4 className="label">Comment</h4>
              <p>{annotation.text}</p>
            </li>
            <li className="created">
              <h4 className="label">Created</h4>
              <p>
                {annotation.created ? annotation.created.substring(0, 10) : "-"}
              </p>
            </li>
          </ul>
        );
      case "link":
        return (
          <ul className="info annotation-link">
            <li className="primary">
              <h4 className="label">Label</h4>
              <p>{annotation.label}</p>
            </li>
            <li className="link">
              <h4 className="label">Link</h4>
              <p>
                <a
                  rel="noopener noreferrer"
                  target="_blank"
                  href={"https:" + annotation.url}
                >
                  {annotation.url ? annotation.url.replace(/^\/\//i, "") : ""}
                </a>
              </p>
            </li>
            <li className="created">
              <h4 className="label">Created</h4>
              <p>
                {annotation.created ? annotation.created.substring(0, 10) : "-"}
              </p>
            </li>
          </ul>
        );
      case "metadata":
        return (
          // TODO li used to also have primary as className; check if it is needed
          <ul className="info annotation-metadata">
            <li className="template">
              <h4 className="label">Template</h4>
              <p>{annotation.annotationTemplate || "-"}</p>
            </li>

            <li className="template">
              <h4 className="label">Fields</h4>
              <ul>
                {annotation.properties
                  ? annotation.properties.map((property, index) => (
                      <li key={index}>
                        <h4>{property.key}</h4>
                        <p>{property.value}</p>
                      </li>
                    ))
                  : "-"}
              </ul>
            </li>

            <li className="created">
              <h4 className="label">Created</h4>
              <p>
                {annotation.created ? annotation.created.substring(0, 10) : "-"}
              </p>
            </li>
          </ul>
        );
      default:
        return (
          <ul>
            <li>Unknown annotation type: {annotation.annotationType}</li>
          </ul>
        );
    }
  }

  render() {
    const annotation = this.props.annotation;
    const bookmarks = annotation.bookmarks || [];
    const hasBookmarks = bookmarks.length > 0;

    //populate the foldable block (containing a list of bookmarks)
    let foldableBlock = null;
    if (this.props.showSub) {
      let blockContents = null;

      if (!hasBookmarks) {
        blockContents = (
          <p>
            This {annotation.annotationType.toLowerCase() || "annotation"} has
            no bookmarks
          </p>
        );
      } else {
        blockContents = (
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Dataset</th>
                <th>☆ Groups</th>
              </tr>
            </thead>
            <tbody>
              {bookmarks.map((bookmark, i) => (
                <tr key={"b__" + i}>
                  <td className="type">{BookmarkTranslator(bookmark.type)}</td>
                  <td>{bookmark.object.title}</td>
                  <td>{bookmark.collectionId}</td>
                  <td className="groups">
                    {bookmark.groups
                      ? bookmark.groups.map((g, j) => (
                          <span key={"gl__" + j}>{g.label}</span>
                        ))
                      : null}
                  </td>
                  <td className="actions">
                    <div
                      className="btn primary"
                      onClick={this.onView.bind(this, bookmark)}
                    >
                      View
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      foldableBlock = <div className="sublevel">{blockContents}</div>;
    }

    return (
      <div
        className={classNames(
          IDUtil.cssClassName("annotation-row"),
          "item-row"
        )}
      >
        <div className="item">
          <div className="selector">
            <input
              type="checkbox"
              checked={this.props.selected}
              onChange={this.onSelectChange.bind(this)}
              title={
                "Select this annotation with id:\n" + annotation.annotationId
              }
            />
          </div>

          {this.getInfoRow(annotation)}

          <div className="actions">
            <div className="row-menu">
              <span>⋮</span>
              <ul>
                <li onClick={this.props.onDelete.bind(this, annotation)}>
                  Delete
                </li>
                <li onClick={this.props.onExport.bind(this, annotation)}>
                  Export
                </li>
              </ul>
            </div>
            <div className="sublevel-button-container">
              <div
                title="Bookmarks"
                className={classNames("sublevel-button facet", {
                  active: this.props.showSub,
                  zero: !hasBookmarks,
                })}
                onClick={this.toggleSub}
              >
                <span className="icon bookmark" />{" "}
                <span className="count">{bookmarks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {foldableBlock}
      </div>
    );
  }
}

AnnotationRow.propTypes = {
  annotation: PropTypes.object.isRequired,
  toggleSub: PropTypes.func.isRequired,
  showSub: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
  onView: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
};

export default AnnotationRow;
