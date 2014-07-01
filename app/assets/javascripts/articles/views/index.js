// define the view "Index"
Article.View.Index = Backbone.View.extend({
  el: 'body',
  
  template: JST["articles/templates/index"],
  
  render: function() {
    var that = this;
    
    var articles = new Article.Collection();
    articles.fetch({
      success: function(articles) {
        $(function() {
          that.$el.html(that.template({articles: articles.models}));
        }); 
      }
    });
  }
});
