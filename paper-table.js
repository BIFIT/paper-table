'use strict';
new Polymer({
  is: 'paper-table',
  behaviors: [Polymer.MyBehaviors.paperTableBehaviour],

  ready() {

    Promise.resolve()
      .then(this._setColumnsAsync())
      .then(this._addScrollEvents())
      .catch(console.log.bind(console));
  }

});
