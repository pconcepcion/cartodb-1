var Backbone = require('backbone');
var checkAndBuildOpts = require('builder/helpers/required-opts');
var STATES = require('./query-base-status');

var CONTEXTS = {
  MAP: 'map',
  TABLE: 'table'
};

var REQUIRED_OPTS = [
  'querySchemaModel',
  'queryGeometryModel',
  'queryRowsCollection'
];

var LayerContentModel = Backbone.Model.extend({
  defaults: {
    context: CONTEXTS.MAP, // map or table
    // This variable `state` is only used for the trigger change:state event.
    // It lives in the model so, as long as the model is recreated with the view every time,
    // this variable is not shared between views and can NOT use it to get the real state.
    state: STATES.unavailable
  },

  initialize: function (attrs, opts) {
    checkAndBuildOpts(opts, REQUIRED_OPTS, this);

    this._initBinds();
  },

  _initBinds: function () {
    this.listenTo(this._querySchemaModel, 'change:status', this._setState);
    this.listenTo(this._queryGeometryModel, 'change:status', this._setState);
    this.listenTo(this._queryRowsCollection.statusModel, 'change:status', this._setState);
  },

  _setState: function () {
    if (this._isErrored()) {
      this.set({ state: STATES.errored });
    } else if (this._isFetched()) {
      this.set({ state: STATES.fetched });
    } else {
      this.set({ state: STATES.fetching });
    }
  },

  _isErrored: function () {
    return this._querySchemaModel.hasRepeatedErrors() ||
      this._queryGeometryModel.hasRepeatedErrors() ||
      this._queryRowsCollection.hasRepeatedErrors();
  },

  _isFetching: function () {
    return this._querySchemaModel.isFetching() ||
      this._queryGeometryModel.isFetching() ||
      this._queryRowsCollection.isFetching();
  },

  _isFetched: function () {
    return this._querySchemaModel.isFetched() &&
      this._queryGeometryModel.isFetched() &&
      this._queryRowsCollection.isFetched();
  },

  isErrored: function () {
    return this._isErrored();
  },

  isFetching: function () {
    return this._isFetching();
  },

  isFetched: function () {
    return this._isFetched();
  },

  isDone: function () {
    return this.isFetched() || this.isErrored();
  }
});

LayerContentModel.CONTEXTS = CONTEXTS;
LayerContentModel.STATES = STATES;

module.exports = LayerContentModel;
