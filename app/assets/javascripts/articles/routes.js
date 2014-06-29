// namespace "ns_articles"
var ns_articles = ns_articles || {};


// define the articles "Router"
ns_articles.Router = Backbone.Router.extend({
  routes: {
    '': 'index'
  },
  
  index: function() {
    var indexView = new ns_articles.Index();
    indexView.render();
  }
});

