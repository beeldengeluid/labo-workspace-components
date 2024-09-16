import React from "react";
import PropTypes from "prop-types";
import IDUtil from "../../util/IDUtil";
import "./NestedTable.scss";

/**
 * Display a bookmark/annotation result list and handle the filtering and sorting
 */
class NestedTable extends React.PureComponent {
  constructor(props) {
    super(props);

    // retrieve persistent filters from localstorage
    this.filterKey = props.uid + "-filter";
    const filter = { keywords: "" };

    this.state = {
      filteredItems: [],
      visibleItems: [],
      loading: true,
      order: "created",
      filter,
    };
  }

  //load and filter data
  reloadData() {
    // filter
    const filtered = this.props.filterItems(
      this.props.items,
      this.state.filter,
    );

    // sort
    const sorted = this.props.sortItems(filtered, this.state.order);
    // update state
    this.setState({
      filteredItems: filtered,
      visibleItems: sorted,
    });
  }

  setSort(field) {
    this.setState({
      order: field,
      // filter list from original items to keep sort list consistent
      visibleItems: this.props.sortItems(this.state.filteredItems, field),
    });
  }

  //Listen for update, request new data if filter has been changed
  // eslint-disable-next-line no-unused-vars
  componentDidUpdate(prevProps, prevState) {
    //listen for items change
    if (prevProps.items != this.props.items) {
      this.reloadData();
      return;
    }

    // listen for filter change
    if (this.lastFilter !== this.state.filter) {
      this.lastFilter = this.state.filter;

      // throttle data requests
      if (this.requestDataTimeout) {
        clearTimeout(this.requestDataTimeout);
        this.requestDataTimeout = setTimeout(this.reloadData.bind(this), 300);
      } else {
        // firstrun
        this.reloadData();
      }
    }
  }

  // user changes a filter
  filterChange(key, e) {
    let filter = {};
    filter[key] = e.target.value;

    // create filter
    filter = Object.assign({}, this.state.filter, filter);

    // update state
    this.setState({
      filter,
    });
  }

  //when the sort type changes
  sortChange(e) {
    this.setSort(e.target.value);
  }

  // render filters
  renderFilters(filters) {
    return filters.map((filter, index) => {
      if (filter.type === "search") {
        return (
          <div key={index} className="filter-container">
            <input
              className="search"
              type="text"
              placeholder={filter.placeholder || "Search"}
              value={this.state.filter[filter.key]}
              onChange={this.filterChange.bind(this, filter.key)}
            />
          </div>
        );
      } else if (filter.type === "select") {
        return (
          <div key={index} className="filter-container">
            <span>
              <label
                className="type-label"
                title={filter.titleAttr ? filter.titleAttr : null}
              >
                {filter.title}
              </label>

              <select
                disabled={filter.options.length == 0}
                className="type-select"
                value={this.state.filter[filter.key]}
                onChange={this.filterChange.bind(this, filter.key)}
              >
                <option />
                {filter.options.map((option, index) => (
                  <option
                    key={index}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.name}
                  </option>
                ))}
              </select>
            </span>
          </div>
        );
      }

      console.error("Unknown filter type", filter);
      return null;
    });
  }

  render() {
    return (
      <div className={IDUtil.cssClassName("nested-table")}>
        <div className="tools">
          {/*<div className="export-button btn primary"
                        onClick={this.props.onExport.bind(this, this.state.visibleItems)}>
                        Export all
                    </div>*/}
          <div className="left">
            <h3>Filters</h3>
            {this.renderFilters(this.props.filters)}
          </div>
        </div>

        <div className="results">
          <div className="sort">
            <h3>Order</h3>

            <select
              value={this.state.order}
              onChange={this.sortChange.bind(this)}
            >
              {this.props.orders.map((type, index) => (
                <option key={index} value={type.value}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          {this.props.renderResults(this.state)}
        </div>
      </div>
    );
  }
}

NestedTable.propTypes = {
  uid: PropTypes.string,
  filterItems: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.string,
      placeholder: PropTypes.string,
      key: PropTypes.string,
      title: PropTypes.string,
      titleAttr: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string,
          disable: PropTypes.bool,
          name: PropTypes.string,
        }),
      ),
    }),
  ),
  items: PropTypes.array.isRequired,
  onExport: PropTypes.func.isRequired,
  orders: PropTypes.array.isRequired,
  renderResults: PropTypes.func.isRequired,
  selection: PropTypes.array,
  sortItems: PropTypes.func.isRequired,
};

NestedTable.defaultProps = {
  filters: {},
};

export default NestedTable;
