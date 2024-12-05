import React from "react";
import PropTypes from "prop-types";
import AnnotationAPI from "../../../api/AnnotationAPI";
import IDUtil from "../../../util/IDUtil";
import TimeUtil from "../../../util/TimeUtil";

import { exportDataAsJSON } from "../../helpers/Export";
import BulkActions from "../../helpers/BulkActions";
import {
  createAnnotationOptionList,
  createClassificationOptionList,
  createSimpleArrayOptionList,
} from "../../helpers/OptionList";

import ResourceViewerModal from "../../ResourceViewerModal";
import FlexRouter from "../../../util/FlexRouter";
import BookmarkRow from "./BookmarkRow";
import NestedTable from "../../helpers/NestedTable";
import CollectionUtil from "../../../util/CollectionUtil";
import LocalStorageHandler from "../../../util/LocalStorageHandler";
import Loading from "../../../shared/Loading";
import "./BookmarkTable.scss";

const CUSTOM = "custom"; // removed AnnotationConstants (still in labo-components)
/**
 * This view handles the loading, filtering and selection of data of
 * the Bookmarks list of a project. It is displayed using the NestedTable component.
 */
class BookmarkTable extends React.PureComponent {
  constructor(props) {
    super(props);

    this.orders = [
      { value: "created", name: "Bookmark created" },
      { value: "newest", name: "Newest objects first" },
      { value: "oldest", name: "Oldest objects first" },
      { value: "name-az", name: "Title A-Z" },
      { value: "name-za", name: "Title Z-A" },
      { value: "mediatype", name: "Media" },
      { value: "playable", name: "Playable" },
      { value: "dataset", name: "Dataset" },
      { value: "group", name: "Groups" },
    ];

    this.bulkActions = [
      { title: "Delete", onApply: this.deleteBookmarks },
      { title: "Export", onApply: this.exportBookmarks },
    ];

    this.state = {
      annotations: [], //FIXME no longer filled with the new API call!!
      bookmarks: [],
      selection: [],
      subMediaObject: {},
      subSegment: {},
      loading: true,
      detailBookmark: null,
      filters: [],
    };
  }

  componentDidMount() {
    this.loadBookmarks();
  }

  loadBookmarks() {
    this.setState({
      loading: true,
    });

    AnnotationAPI.getBookmarks(
      this.props.user.id,
      this.props.project.id,
      this.onLoadResourceList,
    );
  }

  //The resource list now also contains the data of the resources
  onLoadResourceList = (bookmarks) => {
    this.setState(
      {
        bookmarks: bookmarks,
        loading: false,
        filters: this.getFilters(bookmarks),
      },
      () => {
        this.updateSelection(bookmarks);
      },
    );
  };

  //Get filter object
  getFilters(items) {
    return [
      // search filter
      {
        title: "",
        key: "keywords",
        type: "search",
        placeholder: "Search Bookmarks",
      },

      // type filter
      {
        title: "Media",
        key: "mediaType",
        type: "select",
        options: createSimpleArrayOptionList(items, (i) => i.object.mediaTypes),
      },
      // group filter
      {
        title: "Group",
        key: "group",
        type: "select",
        titleAttr: "Bookmark group",
        options: createClassificationOptionList(items, "groups"),
      },
      // annotations filter
      {
        title: "Annotations",
        key: "annotations",
        type: "select",
        titleAttr: "MediaObject annotations",
        options: [
          { value: "yes", name: "With annotations" },
          { value: "no", name: "Without annotations" },
          { value: "", name: "-----------", disabled: true },
        ].concat(createAnnotationOptionList(items)),
      },
      // segment filter
      {
        title: "Segments",
        key: "segments",
        type: "select",
        options: [
          { value: "yes", name: "Yes" },
          { value: "no", name: "No" },
        ],
      },
    ];
  }

  //Update Selection list, based on available items
  updateSelection(items) {
    this.setState({
      selection: items.filter((item) =>
        this.state.selection.some((i) => i.resourceId === item.resourceId),
      ),
    });
  }

  filterBookmarks = (bookmarks, filter) => {
    // filter on type
    if (filter.mediaType) {
      bookmarks = bookmarks.filter(
        (bookmark) =>
          bookmark.object &&
          bookmark.object.mediaTypes &&
          bookmark.object.mediaTypes.includes(filter.mediaType),
      );
    }

    // filter on group
    if (filter.group) {
      bookmarks = bookmarks.filter(
        (bookmark) =>
          bookmark.groups &&
          bookmark.groups.some((g) => g.annotationId === filter.group),
      );
    }

    // filter on annotations
    if (filter.annotations) {
      switch (filter.annotations) {
        case "yes":
          bookmarks = bookmarks.filter(
            (bookmark) =>
              bookmark.annotations.filter(
                (annotation) => annotation.annotationType !== CUSTOM,
              ).length > 0,
          );
          break;
        case "no":
          bookmarks = bookmarks.filter(
            (bookmark) =>
              bookmark.annotations.filter(
                (annotation) => annotation.annotationType !== CUSTOM,
              ).length === 0,
          );
          break;
        default:
          bookmarks = bookmarks.filter((bookmark) =>
            bookmark.annotations
              .filter((annotation) => annotation.annotationType !== CUSTOM)
              .some((a) => a.annotationType === filter.annotations),
          );
      }
    }

    // filter on segments
    if (filter.segments) {
      switch (filter.segments) {
        case "yes":
          bookmarks = bookmarks.filter(
            (bookmark) => bookmark.segments.length > 0,
          );
          break;
        case "no":
          bookmarks = bookmarks.filter(
            (bookmark) => bookmark.segments.length === 0,
          );
          break;
      }
    }

    // filter on keywords in title, dataset or type
    if (filter.keywords) {
      const keywords = filter.keywords.split(" ");
      keywords.forEach((k) => {
        k = k.toLowerCase();
        bookmarks = bookmarks.filter(
          (bookmark) =>
            // object
            (bookmark.object &&
              Object.keys(bookmark.object).some(
                (key) =>
                  typeof bookmark.object[key] === "string" &&
                  bookmark.object[key].toLowerCase().includes(k),
              )) ||
            // annotations
            (bookmark.annotations &&
              bookmark.annotations.some(
                (annotation) =>
                  annotation.annotationType !== CUSTOM &&
                  Object.keys(annotation).some(
                    (key) =>
                      typeof annotation[key] === "string" &&
                      annotation[key].toLowerCase().includes(k),
                  ),
              )),
        );
      });
    }
    return bookmarks;
  };

  sortBookmarks = (bookmarks, field) => {
    if (!bookmarks) {
      return [];
    }

    let collectionClassesList = {};
    const sorted = bookmarks.map((item) => {
      if (!collectionClassesList[item.object.dataset]) {
        collectionClassesList[item.object.dataset] =
          CollectionUtil.getCollectionClass(
            this.props.user.id,
            this.props.user.name,
            item.object.dataset,
            true,
          );
      }

      if (collectionClassesList[item.object.dataset]) {
        const formattedDates = item.object.date
          ? TimeUtil.sortedFormattedDates(
              collectionClassesList[
                item.object.dataset
              ].prototype.getFormattedDates(item.object.date),
            )
          : null;
        // Enhance bookmarks with a timestamp to allow sorting.
        item.object.sortingDate =
          TimeUtil.formattedDatesToLowestTimestamp(formattedDates);
        // Enhance bookmarks with a formatted string/array of dates.
        item.object.formattedDate = formattedDates;
      }
      return item;
    });

    const getFirst = (a, empty) => (a && a.length > 0 ? a[0] : empty);
    switch (field) {
      case "created":
        sorted.sort((a, b) => {
          return (
            (b.object.sortingDate != null) - (a.object.sortingDate != null) ||
            a.object.sortingDate - b.object.sortingDate
          );
        });
        break;
      case "newest":
        sorted.sort(
          (a, b) =>
            (a.object.sortingDate === null) - (b.object.sortingDate === null) ||
            +(a.object.sortingDate < b.object.sortingDate) ||
            -(a.object.sortingDate > b.object.sortingDate),
        );
        break;
      case "oldest":
        sorted.sort(
          (a, b) =>
            (a.object.sortingDate === null) - (b.object.sortingDate === null) ||
            +(a.object.sortingDate > b.object.sortingDate) ||
            -(a.object.sortingDate < b.object.sortingDate),
        );
        break;
      case "name-az":
        sorted.sort((a, b) => (a.object.title > b.object.title ? 1 : -1));
        break;
      case "name-za":
        sorted.sort((a, b) => (a.object.title < b.object.title ? 1 : -1));
        break;
      case "mediatype": {
        // '~' > move empty to bottom
        const e = "~";
        sorted.sort((a, b) =>
          getFirst(a.object.mediaTypes, e) > getFirst(b.object.mediaTypes, e)
            ? 1
            : -1,
        );
        break;
      }
      case "playable":
        sorted.sort((a, b) => (a.object.playable < b.object.playable ? -1 : 1));
        break;
      case "dataset":
        sorted.sort((a, b) => (a.object.dataset > b.object.dataset ? 1 : -1));
        break;
      case "group": {
        // '~' > move empty to bottom
        const e = { label: "~" };
        sorted.sort((a, b) =>
          getFirst(a.groups, e).label > getFirst(b.groups, e).label ? 1 : -1,
        );
        break;
      }
      default:
        return sorted;
    }

    return sorted;
  };

  //delete multiple bookmarks
  deleteBookmarks = (bookmarks) => {
    if (bookmarks) {
      if (
        !confirm(
          "Are you sure you want to remove the selected bookmarks and all its annotations?",
        )
      ) {
        return;
      }

      //populate the deletion list required for the annotation API
      const deletionList = [];
      bookmarks.forEach((b) => {
        b.targetObjects.forEach((targetObject) => {
          deletionList.push({
            annotationId: targetObject.parentAnnotationId,
            type: "target",
            partId: targetObject.assetId,
          });
        });
      });

      //now delete the whole selection in a single call to the API
      AnnotationAPI.deleteUserAnnotations(
        this.props.user.id,
        deletionList,
        (success) => {
          console.debug("success", success);
          setTimeout(() => {
            // load new data
            this.loadBookmarks();

            // update bookmark count in project menu
            this.props.loadBookmarkCount();
          }, 500);
        },
      );
    }
  };

  exportBookmarks = (selection) => {
    const data = this.state.bookmarks.filter((item) =>
      selection.some((i) => i.resourceId === item.resourceId),
    );
    exportDataAsJSON(data);
  };

  deleteBookmark = (bookmark) => {
    this.deleteBookmarks([bookmark]);
  };

  makeActiveProject() {
    LocalStorageHandler.storeJSONInLocalStorage(
      "stored-active-project",
      this.props.project,
    );
  }

  viewBookmark = (bookmark) => {
    // make current project active
    if (bookmark) {
      this.makeActiveProject();
    }
    this.setState({
      detailBookmark: bookmark,
    });
  };

  // opens a new popup window for the specific resourceId
  openResourceViewer = (item, unique) => {
    const resource = {
      index: item.index,
      resourceId: item.resourceId,
      startTime: item.startTime,
    };
    FlexRouter.popupResourceViewer(
      "/tool/resource-viewer",
      resource,
      null,
      "bookmarks-table-resource-viewer-popup" + (unique ? item.resourceId : ""),
      true,
      this.refreshBookmarks,
    );
  };

  selectAllChange = (selectedItems, e) => {
    const newSelection = this.state.selection
      .slice()
      .filter((i) => selectedItems.includes(i)); //copy the array
    selectedItems.forEach((item) => {
      const found = newSelection.find(
        (selected) => selected.resourceId === item.resourceId,
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
  };

  selectItem = (item, select) => {
    let newSelection = this.state.selection.slice(); //copy the array
    const index = newSelection.findIndex((selected) => {
      return selected.resourceId === item.resourceId;
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
  };

  // Refresh the bookmark data (assuming changes have been made)
  refreshBookmarks = () => {
    // set viewbookmark to null
    this.viewBookmark(null);

    // update bookmark count in project menu
    this.props.loadBookmarkCount();

    // refresh data
    this.loadBookmarks();
  };

  // Toggle sublevel mediaobject visibility
  toggleSubMediaObject = (id) => {
    const subMediaObject = Object.assign({}, this.state.subMediaObject);
    if (id in subMediaObject) {
      delete subMediaObject[id];
    } else {
      subMediaObject[id] = true;
    }
    // remove from subSegments
    const subSegment = Object.assign({}, this.state.subSegment);
    delete subSegment[id];

    this.setState({ subMediaObject, subSegment });
  };

  // Toggle sublevel segment visibility
  toggleSubSegment = (id) => {
    const subSegment = Object.assign({}, this.state.subSegment);
    if (id in subSegment) {
      delete subSegment[id];
    } else {
      subSegment[id] = true;
    }
    // remove from subMediaObject
    const subMediaObject = Object.assign({}, this.state.subMediaObject);
    delete subMediaObject[id];

    this.setState({ subMediaObject, subSegment });
  };

  unFoldAll = () => {
    const showSub = {};
    switch (this.foldTarget.value) {
      case "mediaobject":
        this.state.bookmarks.forEach((b) => {
          if (b.annotations && b.annotations.length > 0) {
            showSub[b.resourceId] = true;
          }
        });
        this.setState({ subSegment: {}, subMediaObject: showSub });
        break;
      case "segments":
        this.state.bookmarks.forEach((b) => {
          if (b.segments && b.segments.length > 0) {
            showSub[b.resourceId] = true;
          }
        });
        this.setState({ subSegment: showSub, subMediaObject: {} });
        break;
    }
  };

  foldAll = () => {
    switch (this.foldTarget.value) {
      case "mediaobject":
        this.setState({ subMediaObject: {} });
        break;
      case "segments":
        this.setState({ subSegment: {} });
        break;
    }
  };

  renderResults = (renderState) => {
    const annotationTypeFilter =
      renderState.filter.annotations &&
      !["yes", "no"].includes(renderState.filter.annotations)
        ? renderState.filter.annotations
        : "";
    return (
      <div>
        <h2>
          <input
            type="checkbox"
            checked={
              renderState.visibleItems.length > 0 &&
              renderState.visibleItems.every(
                (item) =>
                  item &&
                  this.state.selection.some(
                    (i) => i.resourceId === item.resourceId,
                  ),
              )
            }
            onChange={this.selectAllChange.bind(this, renderState.visibleItems)}
          />
          Bookmarks:{" "}
          <span className="count">{renderState.visibleItems.length || 0}</span>
          <div className="fold">
            <div className="filter">
              <span onClick={this.unFoldAll}>Show all</span>
              &nbsp;/&nbsp;
              <span onClick={this.foldAll}>Hide all</span>
            </div>
            <select ref={(elem) => (this.foldTarget = elem)}>
              <option value="mediaobject">MediaObject annotations</option>
              <option value="segments">Segments</option>
            </select>
          </div>
        </h2>

        <div className="bookmark-table">
          {renderState.visibleItems.length ? (
            renderState.visibleItems.map((bookmark) => (
              <BookmarkRow
                key={bookmark.resourceId}
                bookmark={bookmark}
                onDelete={this.deleteBookmark}
                onExport={exportDataAsJSON}
                openResourceViewer={this.openResourceViewer}
                selected={
                  this.state.selection.find(
                    (item) => item.resourceId === bookmark.resourceId,
                  ) !== undefined
                }
                onSelect={this.selectItem}
                showSubMediaObject={
                  bookmark.resourceId in this.state.subMediaObject
                }
                showSubSegment={bookmark.resourceId in this.state.subSegment}
                toggleSubMediaObject={this.toggleSubMediaObject}
                toggleSubSegment={this.toggleSubSegment}
                annotationTypeFilter={annotationTypeFilter}
                project={this.props.project}
              />
            ))
          ) : (
            <h3>∅ No results</h3>
          )}
        </div>
      </div>
    );
  };

  render() {
    if (this.state.loading) {
      //FIXME the spinner is hidden behind the other content (z-index does nog work)
      return <Loading message="Loading bookmarks..." />;
    } else {
      let detailsModal = null;
      if (this.state.detailBookmark) {
        detailsModal = (
          <ResourceViewerModal
            bookmark={this.state.detailBookmark}
            onClose={this.refreshBookmarks}
          />
        );
      }
      return (
        <div className={IDUtil.cssClassName("bookmark-table")}>
          <NestedTable
            uid={this.props.project.id + "-bookmarks"}
            filterItems={this.filterBookmarks}
            renderResults={this.renderResults}
            onExport={exportDataAsJSON}
            items={this.state.bookmarks}
            sortItems={this.sortBookmarks}
            selection={this.state.selection}
            orders={this.orders}
            filters={this.state.filters}
            toggleSubMediaObject={this.state.subMediaObject}
            toggleSubSegment={this.state.subSegment}
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
}

BookmarkTable.propTypes = {
  user: PropTypes.object.isRequired,
  project: PropTypes.object.isRequired,
  loadBookmarkCount: PropTypes.func.isRequired,
  openResourceViewer: PropTypes.func,
  viewBookmark: PropTypes.func,
};

export default BookmarkTable;
