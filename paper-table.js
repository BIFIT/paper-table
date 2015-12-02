'use strict';

new Polymer({
  is: 'paper-table',
  behaviors: [Polymer.MyBehaviors.paperTableBehaviour],

  created() {
  },

  ready() {

    Promise.resolve()
      .then(this._setColumnsAsync())
      .then(this._addScrollEvents())
      .catch(console.log.bind(console));
  }

});

new Polymer({
  is: 'paper-column',

  ready() {
  }

});