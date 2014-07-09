// define the articles "Router"
Articles.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'articles': 'index',
    'articles/new': 'new',
    'article/:id': 'show'
  },

  
  index: function() {
    var viewIndex = new Articles.Views.Index();
    viewIndex.render();
  },

  
  'new': function() {
    var viewNew = new Articles.Views.New();
    viewNew.render();
  },
  
  
  show: function(id) {
    var viewShow = new Articles.Views.Show();
    viewShow.render({id: id});
  }
});

