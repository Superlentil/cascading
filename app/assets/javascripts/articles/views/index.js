// define the view "Index"
Article.View.Index = Backbone.View.extend({
  el: 'body',
  
  template: JST["articles/templates/index"],
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
  }
});
