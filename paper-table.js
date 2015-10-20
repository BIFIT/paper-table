'use strict';
new Polymer({
  is: 'paper-table',

  properties: {

    label: {
      type: String,
      notify: false,
      value: function () {
        return '';
      }
    },

    columns: {
      type: Array
    },

    rows: {
      type: Array
    },

    filterValue: {
      type: String
    },

    filterColumn: {
      type: String
    },

    sortColumn: {
      type: String
    },

    sortDescending: {
      type: String,
      value: 'false'
    }

  },

  /**
   * Сотрировка и выдача не приватных полей
   * @param e
   * @returns {*}
   * @private
   */
  _rowPublicKeys: function (e) {

    return Object.keys(e).filter(e => {
      if (e.startsWith('_')) {
        return false;
      }

      return true;
    });

  },

  /**
   * Описание ячейки
   * @param row
   * @param label
   * @returns {*}
   * @private
   */
  _getRowLabel: function (row, label) {
    return row[label];
  },

  /**
   * Клик на ячейку
   * @param e
   * @private
   */
  _selectElem: function (e) {
    page.show(e.model.row._href);
  },

  /**
   * Проверка на наличие хэдера
   * @returns {boolean}
   */
  hasTitle: function () {
    return !!this.getAttribute('label');
  },

  _resetIcons: function () {
    var $icons = this.querySelectorAll('th paper-icon-button');
    for (let i = 0; i < $icons.length; i++) {
      let icon = $icons[i];
      Polymer.Base.transform('rotate(-90deg)', icon);
      icon.classList.remove('selected');
    }
  },

  /**
   * Сортировка по назавнию столбца
   * @param e
   */
  sortByColumn: function (e) {
    this.sortColumn = e.model.column.name;

    this._resetIcons();

    this.sortDescending = (this.sortDescending === 'true') ?
      'false' :
      'true';

    e.currentTarget.classList.add('selected');

    if (this.sortDescending === 'true') {
      Polymer.Base.transform('rotate(-90deg)', e.currentTarget);
    } else {
      Polymer.Base.transform('rotate(90deg)', e.currentTarget);
    }
  },

  /**
   * Фильтрация по значению
   * @param e
   */
  filterByColumn: function (e) {
    this.filterValue = e.currentTarget.value;
    this.filterColumn = e.model.column.name;
  },

  /**
   * Сортировка по ключу
   * @param key
   * @param order
   * @returns {Function}
   * @private
   */
  _sortByKey: function (key, order) {
    /**
     * Сортировка по ключу
     * @param a
     * @param b
     * @returns {number}
     */
    var sortByKey = function (a, b) {
      let key1 = a[key];
      let key2 = b[key];

      if ((typeof key1 === 'undefined') || (typeof key2 === 'undefined')) {
        throw 'Not key detected';
      }

      if ((typeof key1 === 'string') && (typeof key2 === 'string')) {
        key1 = key1.toLowerCase();
        key2 = key2.toLowerCase();

        return (
          (key1 < key2) ?
            -1 :
            (key1 > key2) ?
              1 :
              0
        );
      }

      return key2 - key1;
    };

    /**
     * Сортировка по индексу
     * @param a
     * @param b
     * @returns {number}
     */
    var sortByIndex = function (a, b) {
      return b.index - a.index;
    };

    /**
     * Прямая сортировка
     * @param a
     * @param b
     * @returns {*}
     */
    var sort = function (a, b) {
      if (b > 0) {
        return -1;
      } else if (b < 0) {
        return 1;
      } else {
        return 0;
      }
    };

    /**
     * Обратная сортировка
     * @param a
     * @param b
     * @returns {*}
     */
    var sortInvert = function (a, b) {
      if (b > 0) {
        return 1;
      } else if (b < 0) {
        return -1;
      } else {
        return a;
      }
    };

    /**
     * Сотрировка по-возрастанию
     * @param a
     * @param b
     * @returns {*}
     */
    var sorterAsc = function (a, b) {
      let var1 = sortByIndex(b, a);
      let var2 = sortByKey(a, b);

      return sort(var1, var2);
    };

    /**
     * Сортировка по-убыванию
     * @param a
     * @param b
     * @returns {*}
     */
    var sorterDesc = function (a, b) {
      let var1 = sortByIndex(b, a);
      let var2 = sortByKey(a, b);

      return sortInvert(var1, var2);
    };

    if (order === 'false') {
      return sorterDesc;
    } else {
      return sorterAsc;
    }

  },

  /**
   * Фильтрация по ключу
   * @param value
   * @param column
   * @returns {Function}
   * @private
   */
  _filterByKey: function (value, column) {

    return function (elem) {
      if (!value) {
        return true;
      }

      if (!elem) {
        return false;
      }

      switch (typeof elem[column]) {
        case 'number':

          if (String(elem[column]).startsWith(value)) {
            return 1;
          }

          break;

        case 'string':
          if (String(elem[column]).search(new RegExp(value, 'i')) > -1) {
            return 1;
          }

          break;
      }

    };

  },

  /**
   * берем данные из "контента"
   * @private
   */
  _setColumnsAsync: function () {
    let childNodes = Polymer.dom(this).childNodes;

    this.async(() => {
      let paperColumnArray = [];

      childNodes
        .filter(e => {
          return e.nodeName === 'PAPER-COLUMN';
        })
        .forEach(e => {

          paperColumnArray.push({
            label: e.getAttribute('label') || '',
            sortable: e.getAttribute('sortable') !== null,
            filter: e.getAttribute('filter') !== null,
            name: e.getAttribute('name') || ''
          });

        });

      this.set('columns', paperColumnArray);
    });

  },

  ready: function () {
    this._setColumnsAsync();

    var self = this;
    var thead = this.$$('thead');
    var scrollContainer = null;

    this.async(() => {
      try {
        scrollContainer = document.querySelector('#mainContainer');
        scrollContainer.onscroll = scrollHandler;
      } catch(e) {
        console.warn(e);
      }
    }, 1);

    function scrollHandler() {
      if (scrollContainer.scrollTop > 48) {
        self.transform(`translateY(${scrollContainer.scrollTop - 32}px)`, thead);
      } else {
        self.transform(`translateY(0px)`, thead);
      }
    }
  }

});
