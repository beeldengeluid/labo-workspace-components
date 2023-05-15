import React from "react";
import IDUtil from "../../../util/IDUtil";
import IconUtil from "../../../util/IconUtil";
import AnnotationUtil from "../../../util/AnnotationUtil";
import { CUSTOM } from "../../../util/AnnotationConstants";
import { secToTime } from "../../helpers/time";
import { AnnotationTranslator } from "../../helpers/AnnotationTranslator";
import classNames from "classnames";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

/**
 * A row with bookmark information, and actions, and sub level annotations
 */
class BookmarkRow extends React.PureComponent {
  constructor(props) {
    super(props);
  }

  onDelete = () => this.props.onDelete([this.props.bookmark.resourceId]);

  openResourceViewer = (e, startTime = null) => {
    if (this.props.bookmark.object) {
      this.props.openResourceViewer(
        {
          resourceId: this.props.bookmark.object.id,
          index: this.props.bookmark.object.dataset,
          startTime,
        },
        e.shiftKey
      );
    }
  };

  onSelectChange(e) {
    this.props.onSelect(this.props.bookmark, e.target.checked);
  }

  // eslint-disable-next-line no-unused-vars
  toggleSubMediaObject = (e) =>
    this.props.toggleSubMediaObject(this.props.bookmark.resourceId);

  // eslint-disable-next-line no-unused-vars
  toggleSubSegment = (e) =>
    this.props.toggleSubSegment(this.props.bookmark.resourceId);

  renderSubMediaObject(bookmark, annotations, showHeader) {
    // sort annotations by type
    annotations.sort((a, b) => (a.annotationType > b.annotationType ? 1 : -1));

    return !annotations || annotations.length === 0 ? (
      <p>No annotations available</p>
    ) : (
      <table>
        {showHeader ? (
          <thead>
            <tr>
              <th>Type</th>
              <th>Content</th>
              <th>Details</th>
            </tr>
          </thead>
        ) : null}
        <tbody>
          {annotations.map((annotation, i) => {
            return (
              <tr key={"a__" + i}>
                <td className="type bold">
                  <Link
                    to={
                      "/workspace/projects/" +
                      this.props.projectId +
                      "/annotations#" +
                      annotation.annotationType +
                      "-centric"
                    }
                  >
                    {AnnotationTranslator(annotation.annotationType)}
                  </Link>
                </td>
                <td className="content">
                  {AnnotationUtil.annotationBodyToPrettyText(annotation)}
                </td>
                <td className="details">
                  {annotation.vocabulary
                    ? "Vocabulary: " + annotation.vocabulary
                    : null}
                  {annotation.annotationType === "comment"
                    ? annotation.created
                    : null}
                  {annotation.url ? (
                    <a
                      rel="noopener noreferrer"
                      target="_blank"
                      href={"https:" + annotation.url}
                    >
                      {annotation.url
                        ? annotation.url.replace(/^\/\//i, "")
                        : ""}
                    </a>
                  ) : null}
                  {annotation.annotationTemplate
                    ? "Template: " + annotation.annotationTemplate
                    : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  renderSubSegment(bookmark, segments) {
    return !segments || segments.length === 0 ? (
      <p>
        This {bookmark.object.type.toLowerCase() || "object"} has no fragments
        yet
      </p>
    ) : (
      <table>
        <thead>
          <tr>
            <th className="time">Start/End time</th>
            <th>
              <table>
                <thead>
                  <tr>
                    <th className="type">Type</th>
                    <th className="content">Content</th>
                    <th className="details">Details</th>
                  </tr>
                </thead>
              </table>
            </th>
          </tr>
        </thead>
        <tbody>
          {segments.map((segment, i) => (
            <tr key={"ss__" + i}>
              <td className="time">
                {segment.selector && segment.selector.refinedBy ? (
                  <span
                    onClick={() =>
                      this.openResourceViewer(
                        this,
                        parseInt(segment.selector.refinedBy.start)
                      )
                    }
                    title={"View segment in resource viewer"}
                    className="go-to-segment-link"
                  >
                    {secToTime(
                      Math.round(segment.selector.refinedBy.start || 0)
                    ) +
                      " - " +
                      secToTime(
                        Math.round(segment.selector.refinedBy.end || 0)
                      )}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td>
                {this.renderSubMediaObject(segment, segment.annotations, false)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  render() {
    const bookmark = this.props.bookmark;

    // prepare annotations
    let annotations = bookmark.annotations || [];

    // filter out CUSTOM annotations
    annotations = annotations.filter(
      (annotation) => annotation.annotationType !== CUSTOM
    );

    if (this.props.annotationTypeFilter) {
      // only show annotations of the type specified by the current filter
      annotations = annotations.filter(
        (a) => a.annotationType === this.props.annotationTypeFilter
      );
    }
    const hasAnnotations = annotations.length > 0;

    // prepare segments
    const segments = bookmark.segments || [];
    const hasSegments = segments.length > 0;

    //populate the foldable annotation block
    let foldableBlock = null;

    // render correct foldable block, if visible
    switch (true) {
      case this.props.showSubMediaObject:
        foldableBlock = (
          <div className="sublevel">
            {this.renderSubMediaObject(bookmark, annotations, true)}
          </div>
        );
        break;
      case this.props.showSubSegment:
        foldableBlock = (
          <div className="sublevel">
            {this.renderSubSegment(bookmark, segments)}
          </div>
        );
    }

    //format the date of the resource/target (i.e. bookmark.object.formattedDate, which is always an array)
    const resourceDate = bookmark.object.formattedDate
      ? bookmark.object.formattedDate.map((d, i) => (
          <span key={"rsd__" + i}>
            {d}
            <br />
          </span>
        ))
      : null;

    //show the user what media can be expected
    let mediaIcon = null;
    let playableIcon = (
      <span
        className={IconUtil.getMediaObjectAccessIcon(
          false,
          false,
          true,
          true,
          false
        )}
        title="Media object(s) not accessible"
      ></span>
    );
    if (bookmark.object.mediaTypes) {
      mediaIcon = bookmark.object.mediaTypes.map((mt, i) => {
        if (mt === "video") {
          return (
            <span
              key={"mti__" + i}
              className={IconUtil.getMimeTypeIcon("video", true, true, false)}
              title="Video content"
            ></span>
          );
        } else if (mt === "audio") {
          return (
            <span
              key={"mti__" + i}
              className={IconUtil.getMimeTypeIcon("audio", true, true, false)}
              title="Audio content"
            ></span>
          );
        } else if (mt === "image") {
          return (
            <span
              key={"mti__" + i}
              className={IconUtil.getMimeTypeIcon("image", true, true, false)}
              title="Image content"
            ></span>
          );
        } else if (mt === "text") {
          return (
            <span
              key={"mti__" + i}
              className={IconUtil.getMimeTypeIcon("text", true, true, false)}
              title="Textual content"
            ></span>
          );
        }
      });
    }
    if (bookmark.object.playable) {
      playableIcon = (
        <span
          className={IconUtil.getMediaObjectAccessIcon(
            true,
            true,
            true,
            true,
            false
          )}
          title="Media object(s) can be viewed"
        ></span>
      );
    }

    return (
      <div
        className={classNames(IDUtil.cssClassName("bookmark-row"), "item-row")}
      >
        <div className="item">
          <div className="selector">
            <input
              type="checkbox"
              checked={this.props.selected}
              onChange={this.onSelectChange.bind(this)}
              title={
                "Select this bookmark with resource ID:\n" + bookmark.resourceId
              }
            />
          </div>

          <div
            className="image"
            title={"Resource ID: " + bookmark.resourceId}
            onClick={this.openResourceViewer}
            style={{
              backgroundImage: "url(" + bookmark.object.placeholderImage + ")",
            }}
          />

          <ul className="info">
            <li className="primary content-title">
              <h4 className="label">Title</h4>
              <p
                onClick={this.openResourceViewer}
                title={"Resource ID: " + bookmark.resourceId}
              >
                {bookmark.object.error
                  ? "error: source catalogue not available"
                  : bookmark.object.title}
              </p>
            </li>
            <li className="content-date">
              <h4 className="label">Date</h4>
              <p title={bookmark.object.dateField}>{resourceDate}</p>
            </li>
            <li className="content-media">
              <h4 className="label">Media</h4>
              <p>
                {mediaIcon} {playableIcon}
              </p>
            </li>
            <li className="content-dataset">
              <h4 className="label">Dataset</h4>
              <p>{bookmark.object.dataset}</p>
            </li>
            <li>
              <h4 className="label">Groups</h4>
              <p className="groups">
                {bookmark.groups
                  ? bookmark.groups.map((g, i) => (
                      <span key={"bmgl__" + i}>{g.label}</span>
                    ))
                  : null}
              </p>
            </li>
          </ul>

          <div className="actions">
            <div
              className="btn primary"
              onClick={this.openResourceViewer}
              title="View item (go to resource viewer)"
            >
              View
            </div>

            <div className="row-menu">
              <span>⋮</span>
              <ul>
                <li onClick={this.props.onDelete.bind(this, bookmark)}>
                  Delete
                </li>
                <li onClick={this.props.onExport.bind(this, bookmark)}>
                  Export
                </li>
              </ul>
            </div>

            <div className="sublevel-button-container">
              <div
                title="Fragments"
                className={classNames("sublevel-button", {
                  active: this.props.showSubSegment,
                  zero: !hasSegments,
                  lowered: this.props.showSubMediaObject,
                })}
                onClick={this.toggleSubSegment}
              >
                <span className="icon segment" />
                <span className="count">{segments.length}</span>
              </div>

              <div
                title="MediaObject annotations"
                className={classNames("sublevel-button facet", {
                  active: this.props.showSubMediaObject,
                  zero: !hasAnnotations,
                  lowered: this.props.showSubSegment,
                })}
                onClick={this.toggleSubMediaObject}
              >
                <span className="icon annotation" />
                <span className="count">{annotations.length}</span>
              </div>
            </div>
          </div>
        </div>
        {foldableBlock}
      </div>
    );
  }
}

BookmarkRow.propTypes = {
  projectId: PropTypes.string.isRequired,
  bookmark: PropTypes.object.isRequired,
  toggleSub: PropTypes.func,
  showSub: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
  onExport: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  openResourceViewer: PropTypes.func.isRequired,
  selected: PropTypes.bool,
  annotationTypeFilter: PropTypes.string,
  showSubMediaObject: PropTypes.bool,
  showSubSegment: PropTypes.bool,
  toggleSubMediaObject: PropTypes.func,
  toggleSubSegment: PropTypes.func,
};

export default BookmarkRow;
