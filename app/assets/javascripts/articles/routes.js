// define the articles "Router"
Article.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'articles': 'index',
    'articles/new': 'new'
  },
  
  index: function() {
    var viewIndex = new Article.View.Index();
    viewIndex.render();
  },
  
  'new': function() {
    var viewNew = new Article.View.New();
    viewNew.render();
  }
});

