'use strict';
Polymer.MyBehaviors = Polymer.MyBehaviors || {};

Polymer.MyBehaviors.paperTableBehaviour = {
  properties: {

    label: {
      type: String,
      notify: false,
      value: () => ''
    },

    columns: {
      type: Array
    },

    rows: {
      type: Array,
      observer: '_changeRows'
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
   * Обсервер Rows
   * @private
   */
    _changeRows () {
    this._setFirstIconSelected();
  },

  /**
   * Сотрировка и выдача не приватных полей
   * @param e
   * @returns {*}
   * @private
   */
    _rowPublicKeys (e) {
    return Object.keys(e).filter(item => {
      if (item.startsWith('_')) {
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
    _getRowLabel (row, label) {
    let elem = row[label];

    if(typeof elem === 'boolean') {
      if(elem) {
        return '+';
      } else {
        return '-';
      }
    }

    return elem;
  },

  /**
   * Клик на ячейку
   * @param e
   * @private
   */
    _selectElem (e) {
    page.show(e.model.row._href);
  },

  /**
   * Проверка на наличие хэдера
   * @returns {boolean}
   */
    hasTitle () {
    return !!this.getAttribute('label');
  },

  _resetIcons () {
    let $icons = this.querySelectorAll('th paper-icon-button');
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
    sortByColumn (e) {
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
    filterByColumn (e) {
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
    _sortByKey (key, order) {
    /**
     * Сортировка по ключу
     * @param a
     * @param b
     * @returns {number}
     */
    let sortByKey = (a, b) => {
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
    let sortByIndex = (a, b) => b.index - a.index;

    /**
     * Прямая сортировка
     * @param a
     * @param b
     * @returns {*}
     */
    let sort = (a, b) => {
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
    let sortInvert = (a, b) => {
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
    let sorterAsc = (a, b) => {
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
    let sorterDesc = (a, b) => {
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
    _filterByKey (value, column) {

    return elem => {
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
    _setColumnsAsync () {
    let childNodes = Polymer.dom(this).childNodes;

    this.async(() => {
      let paperColumnArray = [];

      childNodes
        .filter(e => e.nodeName === 'PAPER-COLUMN')
        .forEach(e => {

          paperColumnArray.push({
            label: e.getAttribute('label') || '',
            sortable: e.getAttribute('sortable') !== null,
            filter: e.getAttribute('filter') !== null,
            name: e.getAttribute('name') || ''
          });

        });

      this.set('columns', paperColumnArray);

      Promise.resolve();
    });

  },

  _setFirstIconSelected () {
    this.async(() => {
      let firstIconButton = this.$$('paper-icon-button');
      firstIconButton.classList.add('selected');

      Promise.resolve();
    }, 1);
  }

};
