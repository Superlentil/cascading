// namespace "ns_articles"
var ns_articles = ns_articles || {};


// define the view "Index"
ns_articles.Index = Backbone.View.extend({
  el: 'body',
  
  template: JST["articles/templates/index"],
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
  }
});
