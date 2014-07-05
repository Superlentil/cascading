// define the articles "Router"
Articles.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'articles': 'index',
    'articles/new': 'new'
  },
  
  index: function() {
    var viewIndex = new Articles.Views.Index();
    viewIndex.render();
  },
  
  'new': function() {
    var viewNew = new Articles.Views.New();
    viewNew.render();
  }
});

