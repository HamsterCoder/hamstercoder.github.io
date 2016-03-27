'use strict';

var _CycleDOM = CycleDOM;
var h1 = _CycleDOM.h1;
var p = _CycleDOM.p;
var span = _CycleDOM.span;
var div = _CycleDOM.div;
var table = _CycleDOM.table;
var thead = _CycleDOM.thead;
var tbody = _CycleDOM.tbody;
var tr = _CycleDOM.tr;
var td = _CycleDOM.td;
var th = _CycleDOM.th;
var input = _CycleDOM.input;
var i = _CycleDOM.i;
var makeDOMDriver = _CycleDOM.makeDOMDriver;


var users = [{
  name: 'Rainbow Dash',
  rps: 15
}, {
  name: 'Pinkie Pie',
  rps: 0
}, {
  name: 'Midnight Sparkle',
  rps: 60
}];

function view(state) {
  return div('.container', [h1('Users'), div('.row', [div('.col-sm-6', [input('.filter.form-control', { placeholder: 'Filter...' })])]), table('.users.table.table-striped.table-bordered', [thead([tr([th({ 'data-attribute-name': 'name' }, [span('.user__attribute-name', 'Name'), i(state.sort === 'name' ? '.sort.fa.fa-sort-asc' : '.sort.fa.fa-sort')]), th({ 'data-attribute-name': 'rps' }, [span('.user__attribute-name', 'RPS'), i(state.sort === 'rps' ? '.sort.fa.fa-sort-asc' : '.sort.fa.fa-sort')])])]), tbody([state.users.map(function (user) {
    return tr('.user__item', [td(user.name), td(String(user.rps))]);
  })])])]);
}

function main(source) {
  var users$ = Rx.Observable.of(users);

  var filter$ = source.DOM.select('.filter').events('input').map(function (event) {
    return event.target.value;
  }).startWith('');

  var sort$ = source.DOM.select('.users').select('.sort').events('click').map(function (event) {
    return event.target.parentNode['data-attribute-name'];
  }).startWith('name');

  var state$ = users$.combineLatest(filter$, sort$, function (users, filter, sort) {
    return {
      users: users.sort(function (userA, userB) {
        return userA[sort] > userB[sort] ? 1 : -1;
      }).filter(function (user) {
        return user.name && user.name.indexOf(filter) !== -1;
      }),
      filter: filter,
      sort: sort
    };
  });

  return {
    DOM: state$.map(view)
  };
}

var drivers = {
  DOM: makeDOMDriver('.main')
};

Cycle.run(main, drivers);