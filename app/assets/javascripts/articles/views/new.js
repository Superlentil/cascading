// define the view "New"
Article.View.New = Backbone.View.extend({
  el: 'body',
  
  template: JST['articles/templates/new'],
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
  }
  
});
