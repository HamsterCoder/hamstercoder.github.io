const {h1, p, span, div, table, thead, tbody, tr, td, th, input, i, makeDOMDriver} = CycleDOM;

var users = [
  {
    name: 'Rainbow Dash',
    rps: 15
  },
  {
    name: 'Pinkie Pie',
    rps: 0,
  },
  {
    name: 'Midnight Sparkle',
    rps: 60
  }
];

function view(state) {
   return div('.container', [
     h1('Users'),
     div('.row', [
       div('.col-sm-6', [
         input('.filter.form-control', { placeholder: 'Filter...'})
       ])
     ]),
     table('.users.table.table-striped.table-bordered', [
       thead([
         tr([
           th({'data-attribute-name': 'name'}, [
             span('.user__attribute-name', 'Name'),
             i(state.sort === 'name' ? '.sort.fa.fa-sort-asc' : '.sort.fa.fa-sort')
           ]),
           th({'data-attribute-name': 'rps'}, [
             span('.user__attribute-name', 'RPS'),
             i(state.sort === 'rps' ? '.sort.fa.fa-sort-asc' : '.sort.fa.fa-sort')
           ])
         ])
       ]),
       tbody([
         state.users.map(user => {
           return tr('.user__item', [
             td(user.name),
             td(String(user.rps))
           ])   
         })
       ])
     ])
   ]);
}

function main(source) {
  const users$ = Rx.Observable.of(users);
  
  const filter$ = source.DOM
    .select('.filter')
    .events('input')
    .map(event => event.target.value)
    .startWith('');

  const sort$ = source.DOM
    .select('.users')
    .select('.sort')
    .events('click')
    .map(event => event.target.parentNode['data-attribute-name'])
    .startWith('name');
  
  const state$ = users$.combineLatest(
    filter$,
    sort$,
    (users, filter, sort) => {
      return {
        users: users
          .sort((userA, userB) => userA[sort] > userB[sort] ? 1 : -1)
          .filter(user => user.name && user.name.indexOf(filter) !== -1),
        filter,
        sort
      };
    }
  );
  
  return {
    DOM: state$.map(view)
  };
}

const drivers = {
  DOM: makeDOMDriver('.main')
};

Cycle.run(main, drivers);
