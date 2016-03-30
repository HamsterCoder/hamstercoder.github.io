// COLLECTION
ko.collection = function (params) {
    // remove OR keep (oldElement, undefined)
    // update (oldElement, newData)
    // insert (undefined, newData)

    /**
     * Update whole collection -
     *  existing elements are copied and updated,
     *  new elements are added and updated,
     *  non-specified elements are removed
     * @param {Array} updatedData - data to be placed in collection
     * @returns {Array}
     */
    function updateCollection(updatedData) {
        var currentState = (typeof _latestState === 'undefined') ? [] : _latestState.peek(),
            lookupMap = _latestMap,
            newState = [],
            newLookupMap = {};

        for (var i = 0, len = updatedData.length; i < len; ++i) {
            var newData = updatedData[i],
                newKey = _key(newData);

            if (newKey in newLookupMap) {
                throw new Error('ko.collection: key collision in data');
            }

            newLookupMap[newKey] = i;

            if (newKey in lookupMap && _updateElement) {
                _updateElement(newState[i] = currentState[lookupMap[newKey]], newData);
                // Remove copied element reference
                delete lookupMap[newKey];
            } else {
                if (_createElement) {
                    newState[i] = _createElement(newData);
                    if (_updateElement) {
                        _updateElement(newState[i], newData);
                    }
                } else {
                    newState[i] = _insertElement(newData);
                }
            }
        }

        // Elements that were not updated are passed to remove method
        if (typeof _removeElement === 'function') {
            for (var key in lookupMap) {
                _removeElement(currentState[lookupMap[key]]);
            }
        }

        _latestMap = newLookupMap;
        return newState;
    }

    /**
     * Update existion value or append new values -
     *  existing elements are copied and updated,
     *  new elements are added and updated,
     *  non-specified elements are copied
     * @param {Array} updatedData - data to be placed in collection
     * @returns {Array}
     */
    function mergeCollection(updatedData) {
        var currentState = (typeof _latestState === 'undefined') ? [] : _latestState.peek(),
            lookupMap = _latestMap;

        for (var i = 0, len = updatedData.length; i < len; ++i) {
            var newData = updatedData[i],
                newKey = _key(newData);

            if (newKey in lookupMap && _updateElement) {
                _updateElement(currentState[lookupMap[newKey]], newData, mutation);
            } else {
                lookupMap[newKey] = currentState.length;
                currentState.push(_insertElement(newData));
            }
        }

        return currentState;
    }

    var _updateElement = params['update'], // optional
        _insertElement = params['insert'], // required
        _createElement = params['create'], // alt to insert - required, if insert is omitted
        _removeElement = params['remove'], // optional
        _key = params['key'], // required
        _latestMap = {},
        _latestState = ko.observable([]),
        _collection =  ko.computed({
            read: _latestState,
            write: function (updatedData, isPatch) {
                _latestState((isPatch ? mergeCollection : updateCollection)(updatedData));
            }
        });

    _collection.clear = function () {
        _collection([]);
    };

    _collection.isEmpty = function () {
        return (_latestState.peek().length === 0);
    };

    _collection.peekItem = function (key) {
        var currentIndex = _latestMap[(typeof key === 'object') ? _key(key) : key];

        return _latestState.peek()[currentIndex];
    };

    _collection.getItem = function (key) {
        var currentIndex = _latestMap[(typeof key === 'object') ? _key(key) : key];

        return _latestState()[currentIndex];
    };

    _collection.hasKey = function (key) {
        return Boolean(_latestMap[(typeof key === 'string') ? key : _key(key)]);
    };

    _collection.indexOf = function (key) {
        return _latestMap[(typeof key === 'string') ? key : _key(key)];
    };

    return _collection;
};

// OUR APP
(function () {
    var view = {};

    var operations = [
        {
            id: 'abcd-abcd-abcd',
            progress: 0.69
        },
        {
            id: 'bcde-bcde-bcde',
            progress: 0.01
        }
    ];

    function Operation(data) {
        var view = this;

        view.id = data.id;
        view.data = ko.observable(data);

        view.progress = ko.computed(function () {
            return view.data() && view.data().progress;
        });
    }

    view.operations = ko.collection({
        key: function (data) {
            return data.id;
        },
        insert: function (data) {
            return new Operation(data);
        },
        update: function (item, data) {
            item.data(data);
        }
    });

    view.sort = ko.observable('id');
    view.columns = {
        id: function (item) {
            return item.id;
        },
        progress: function (item) {
            return item.progress();
        }
    };

    view.sortedOperations = ko.computed(function () {
        return view.operations()
            .slice()
            .sort(function (operationA, operationB) {
                var get = view.columns[view.sort()];
                return get(operationA) > get(operationB) ? 1 : -1;
            });
    });

    view.filter = ko.observable('');

    view.filteredOperations = ko.computed(function () {
        return view.sortedOperations()
            .filter(function (operation) {
                return String(operation.id).indexOf(view.filter()) !== -1;
            });
    });


    view.operations(operations);

    ko.applyBindings(view);
})();
