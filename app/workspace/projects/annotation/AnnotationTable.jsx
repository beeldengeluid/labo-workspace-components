import React from "react";
import PropTypes from "prop-types";
import AnnotationAPI from "../../../api/AnnotationAPI";
import IDUtil from "../../../util/IDUtil";
import BulkActions from "../../helpers/BulkActions";
import {
  createOptionList,
  createAnnotationClassificationOptionList,
} from "../../helpers/OptionList";
import { exportDataAsJSON } from "../../helpers/Export";
import ResourceViewerModal from "../../ResourceViewerModal";
import NestedTable from "../../helpers/NestedTable";
import AnnotationRow from "./AnnotationRow";
import classNames from "classnames";
import "./AnnotationTable.scss";

/**
 * This view handles the loading, filtering and selection of data of
 * the Annotations list of a project. It is displayed using the NestedTable component.
 */
class AnnotationTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.title = props.title;

    this.orders = this.getOrders();

    this.bulkActions = [
      { title: "Delete", onApply: this.deleteAnnotations.bind(this) },
      { title: "Export", onApply: this.exportAnnotations.bind(this) },
    ];

    this.state = {
      parentAnnotations: null,
      annotations: [], //these are actually annotation bodies (so objects from annotation['body'])
      selection: [],
      loading: true,
      detailBookmark: null,
      filters: [],
      showSub: {},
    };

    // bind functions (TODO get rid of these, they are unnecessary and confusing)
    this.closeItemDetails = this.closeItemDetails.bind(this);
    this.deleteAnnotations = this.deleteAnnotations.bind(this);
    this.deleteAnnotation = this.deleteAnnotation.bind(this);
    this.exportAnnotations = this.exportAnnotations.bind(this);
    this.exportAnnotation = this.exportAnnotation.bind(this);
    this.filterAnnotations = this.filterAnnotations.bind(this);
    this.renderResults = this.renderResults.bind(this);
    this.selectAllChange = this.selectAllChange.bind(this);
    this.selectItem = this.selectItem.bind(this);
    this.sortAnnotations = this.sortAnnotations.bind(this);
    this.viewBookmark = this.viewBookmark.bind(this);
    this.toggleSub = this.toggleSub.bind(this);
    this.unFoldAll = this.unFoldAll.bind(this);
    this.foldAll = this.foldAll.bind(this);
  }

  componentDidMount() {
    this.loadAnnotations();
  }

  loadAnnotations() {
    AnnotationAPI.getAnnotationBodies(
      this.props.user.id,
      this.props.project.id,
      this.props.type,
      (annotations) => {
        if (annotations) {
          this.setState(
            {
              parentAnnotations: null, //do we still need this for deleting an annotation?
              annotations: annotations,
              loading: false,
              filters: this.getFilters(annotations),
            },
            () => {
              this.updateSelection(annotations);
            }
          );
        }
      }
    );
  }

  //Get sort orders
  // eslint-disable-next-line no-unused-vars
  getOrders(items) {
    const sortNames = {
      created: "Created at",
      // a-z
      "a-z-label": "A-Z",
      "a-z-text": "A-Z",
      // z-a
      "z-a-label": "Z-A",
      "z-a-text": "Z-A",

      vocabulary: "Vocabulary",
      template: "Template",
    };

    return this.props.sort.map((sort) => ({
      value: sort,
      name: sort in sortNames ? sortNames[sort] : "!! " + sort,
    }));
  }

  sortAnnotations(annotations, field) {
    const safeToLowerCase = (s) =>
      s && typeof s === "string" ? s.toLowerCase() : "";
    switch (field) {
      case "created":
        return annotations.sort((a, b) => (a.created < b.created ? 1 : -1));
      case "a-z-label":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.label) > safeToLowerCase(b.label) ? 1 : -1
        );
      case "z-a-label":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.label) < safeToLowerCase(b.label) ? 1 : -1
        );
      case "a-z-text":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.text) > safeToLowerCase(b.text) ? 1 : -1
        );
      case "z-a-text":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.text) < safeToLowerCase(b.text) ? 1 : -1
        );
      case "vocabulary":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.vocabulary) > safeToLowerCase(b.vocabulary) ? 1 : -1
        );
      case "template":
        return annotations.sort((a, b) =>
          safeToLowerCase(a.template) > safeToLowerCase(b.template) ? 1 : -1
        );
      default:
        return annotations;
    }
  }

  //Get filter object
  getFilters(items) {
    return this.props.filters.map((filter) => {
      switch (filter) {
        case "search":
          // search filter
          return {
            title: "",
            key: "keywords",
            type: "search",
            placeholder: "Search Annotations",
          };
        case "vocabulary":
          return {
            title: "Vocabulary",
            key: "vocabulary",
            type: "select",
            options: createOptionList(items, (i) => i["vocabulary"]),
          };
        case "bookmarkGroup":
          return {
            title: "Group",
            titleAttr: "Bookmark group",
            key: "bookmarkGroup",
            type: "select",
            options: createAnnotationClassificationOptionList(items, "groups"),
          };
        case "classification":
          return {
            title: "Code",
            titleAttr: "Bookmark code",
            key: "bookmarkClassification",
            type: "select",
            options: createAnnotationClassificationOptionList(
              items,
              "classifications"
            ),
          };
        default:
          console.error("Unknown filter preset", filter);
      }
    });
  }

  //Update Selection list, based on available items
  updateSelection(items) {
    this.setState({
      selection: items.filter((item) =>
        this.state.selection.some((i) => i.annotationId === item.annotationId)
      ),
    });
  }

  filterByKeyValue(items, getValue, value) {
    return items.filter((i) => getValue(i) === value);
  }

  //Filter annotation list by given filter
  filterAnnotations(annotations, filter) {
    // check the annotation vocabulary
    if (filter.vocabulary) {
      annotations = annotations.filter(
        (a) => a.vocabulary === filter.vocabulary
      );
    }

    // check the groups for each bookmark of each annotation
    if (filter.bookmarkGroup) {
      annotations = annotations.filter((a) =>
        a.bookmarks.some((b) =>
          b.groups.some((c) => c.annotationId === filter.bookmarkGroup)
        )
      );
    }

    // check the classifications for each bookmark of each annotation
    if (filter.bookmarkClassification) {
      annotations = annotations.filter((a) =>
        a.bookmarks.some((b) =>
          b.classifications.some(
            (c) => c.annotationId === filter.bookmarkClassification
          )
        )
      );
    }

    // filter on keywords in title, dataset or type
    if (filter.keywords) {
      const keywords = filter.keywords.split(" ");
      keywords.forEach((k) => {
        k = k.toLowerCase();
        annotations = annotations.filter(
          (annotation) =>
            // annotation
            Object.keys(annotation).some(
              (key) =>
                typeof annotation[key] === "string" &&
                annotation[key].toLowerCase().includes(k)
            ) ||
            // bookmarks
            (annotation.bookmarks &&
              annotation.bookmarks.some(
                (bookmark) =>
                  // bookmark
                  Object.keys(bookmark).some(
                    (key) =>
                      typeof bookmark[key] === "string" &&
                      bookmark[key].toLowerCase().includes(k)
                  ) ||
                  // bookmark-object
                  Object.keys(bookmark.object).some(
                    (key) =>
                      typeof bookmark.object[key] === "string" &&
                      bookmark.object[key].toLowerCase().includes(k)
                  ) ||
                  // bookmark-groups
                  bookmark.groups.some((g) =>
                    g.label.toLowerCase().includes(k)
                  ) ||
                  // bookmark-groups
                  bookmark.classifications.some((g) =>
                    g.label.toLowerCase().includes(k)
                  )
              ))
        );
      });
    }

    return annotations;
  }

  deleteAnnotations(annotationBodies) {
    if (annotationBodies) {
      // always ask before deleting
      let msg = "Are you sure you want to remove the selected annotation";
      msg += annotationBodies.length === 1 ? "?" : "s?";
      if (!confirm(msg)) {
        return;
      }

      //populate the deletion list required for the annotation API
      const deletionList = [];
      annotationBodies.forEach((body) => {
        body.bodyObjects.forEach((annotationBody) => {
          deletionList.push({
            annotationId: annotationBody.parentAnnotationId,
            type: "body",
            partId: annotationBody.annotationId,
          });
        });
      });

      //now delete all the annotations with a single call to the annotation API
      AnnotationAPI.deleteUserAnnotations(
        this.props.user.id,
        deletionList,
        (success) => {
          console.debug("success", success);
          setTimeout(() => {
            // load new data
            this.loadAnnotations();

            // update bookmark count in project menu
            this.props.loadBookmarkCount();
          }, 500);
        }
      );
    }
  }

  deleteAnnotation(annotation) {
    //this.deleteAnnotations([annotation.annotationId]);
    this.deleteAnnotations([annotation]);
  }

  exportAnnotations(annotations) {
    let data = this.state.annotations.filter((item) =>
      annotations.includes(item)
    );

    // remove cyclic structures
    data = data.map((d) => {
      d.bookmarks.forEach((b) => {
        delete b.groups;
        delete b.classifications;
      });
      return d;
    });

    exportDataAsJSON(data);
  }

  exportAnnotation(annotation) {
    this.exportAnnotations([annotation]);
  }

  viewBookmark(bookmark) {
    this.setState({
      detailBookmark: bookmark,
    });
  }

  //Close itemDetails view, and refresh the data (assuming changes have been made)
  closeItemDetails() {
    // set viewbookmark to null
    this.viewBookmark(null);

    // refresh data
    this.loadAnnotations();

    // update bookmark count in project menu
    this.props.loadBookmarkCount();
  }

  sortChange(e) {
    this.setSort(e.target.value);
  }

  //TODO test this function
  selectAllChange(selectedItems, e) {
    const newSelection = this.state.selection
      .slice()
      .filter((i) => selectedItems.includes(i)); //copy the array
    selectedItems.forEach((item) => {
      const found = newSelection.find(
        (selected) => selected.annotationId === item.annotationId
      );
      if (!found && e.target.checked) {
        // add it to the selection
        newSelection.push(item);
      } else if (!e.target.checked && found) {
        // remove the selected item
        newSelection.splice(found, 1);
      }
    });
    this.setState({
      selection: newSelection,
    });
  }

  //TODO test this function
  selectItem(item, select) {
    const newSelection = this.state.selection.slice(); //copy the array
    const index = newSelection.findIndex((selected) => {
      return selected.annotationId === item.annotationId;
    });
    if (index === -1 && select) {
      // add it to the selection
      newSelection.push(item);
    } else if (!select && index !== -1) {
      // remove the selected item
      newSelection.splice(index, 1);
    }
    this.setState({
      selection: newSelection,
    });
  }

  // Toggle sublevel visibility
  toggleSub(id) {
    const showSub = Object.assign({}, this.state.showSub);
    if (id in showSub) {
      delete showSub[id];
    } else {
      showSub[id] = true;
    }
    this.setState({ showSub });
  }

  unFoldAll() {
    const showSub = {};
    this.state.annotations.forEach((b) => {
      if (b.bookmarks && b.bookmarks.length > 0) {
        showSub[b.annotationId] = true;
      }
    });
    this.setState({ showSub });
  }

  foldAll() {
    this.setState({ showSub: {} });
  }

  renderResults(renderState) {
    return (
      <div>
        <h2>
          <input
            type="checkbox"
            checked={
              renderState.visibleItems.length > 0 &&
              renderState.visibleItems.every((item) =>
                this.state.selection.some(
                  (i) => i.annotationId == item.annotationId
                )
              )
            }
            onChange={this.selectAllChange.bind(this, renderState.visibleItems)}
          />
          {this.title} {this.state.renders} :{" "}
          <span className="count">{renderState.visibleItems.length || 0}</span>
          <div className="fold">
            <div className="filter">
              <span onClick={this.unFoldAll}>Show all bookmarks</span> /{" "}
              <span onClick={this.foldAll}>Hide all bookmarks</span>
            </div>
          </div>
        </h2>
        <div className="bookmark-table">
          {renderState.visibleItems.length ? (
            renderState.visibleItems.map((annotation) => (
              <AnnotationRow
                key={annotation.annotationId}
                annotation={annotation}
                onDelete={this.deleteAnnotation}
                onExport={this.exportAnnotation}
                onView={this.viewBookmark}
                selected={
                  this.state.selection.find(
                    (item) => item.annotationId === annotation.annotationId
                  ) !== undefined
                }
                onSelect={this.selectItem}
                showSub={annotation.annotationId in this.state.showSub}
                toggleSub={this.toggleSub}
              />
            ))
          ) : (
            <h3>∅ No results</h3>
          )}
        </div>
      </div>
    );
  }

  render() {
    let detailsModal = null;
    if (this.state.detailBookmark) {
      detailsModal = (
        <ResourceViewerModal
          bookmark={this.state.detailBookmark}
          onClose={this.closeItemDetails}
        />
      );
    }
    return (
      <div
        className={classNames(IDUtil.cssClassName("annotation-table"), {
          loading: this.state.loading,
        })}
      >
        <NestedTable
          items={this.state.annotations}
          selection={this.state.selection}
          sortItems={this.sortAnnotations}
          orders={this.orders}
          filterItems={this.filterAnnotations}
          filters={this.state.filters}
          renderResults={this.renderResults}
          onExport={this.exportAnnotations}
          showSub={this.state.showSub}
          uid={this.props.project.id + "-annotation-" + this.props.type}
        />

        <BulkActions
          bulkActions={this.bulkActions}
          selection={this.state.selection}
        />

        {detailsModal}
      </div>
    );
  }
}

AnnotationTable.propTypes = {
  api: PropTypes.object,
  filters: PropTypes.array.isRequired,
  loadBookmarkCount: PropTypes.func.isRequired,
  sort: PropTypes.array,
  title: PropTypes.string,
  type: PropTypes.string,
  user: PropTypes.object.isRequired,
  project: PropTypes.shape({
    id: PropTypes.string,
  }),
};

AnnotationTable.defaultTypes = {
  filters: [],
  sort: [],
};

export default AnnotationTable;
