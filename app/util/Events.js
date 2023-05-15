/**
 * Events handler
 *
 * Inspired by microevent.js (MIT)
 * https://github.com/jeromeetienne/microevent.js
 */

const Events = function () {
  this._events = {};
  this._data = {};

  this.clear = () => {
    this._events = {};
    return this;
  };

  this.reset = (event) => {
    if (event in this._events === false) return this;
    delete this._events[event];
    return this;
  };

  this.bind = (event, fct) => {
    this._events[event] = this._events[event] || [];
    this._events[event].push(fct);
    return this;
  };

  this.getData = (event) => {
    return event in this._data === false ? null : this._data[event];
  };

  this.unbind = (event, fct) => {
    if (event in this._events === false) return this;
    this._events[event].splice(this._events[event].indexOf(fct), 1);
    return this;
  };

  this.trigger = (event, data) => {
    if (event in this._events === false) return this;

    // store data
    this._data[event] = data;

    // trigger all events
    for (let i = 0; i < this._events[event].length; i++) {
      this._events[event][i](data);
    }

    return this;
  };
};

export default Events;
