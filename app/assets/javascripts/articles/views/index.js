// define the view "Index"
Articles.Views.Index = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["articles/templates/index"],
  
  
  render: function() {
    var that = this;
    
    var articles = new Articles.Collections.Article();
    articles.fetch({
      success: function(articles) {
        $(function() {
          that.$el.html(that.template({articles: articles.models}));
        }); 
      }
    });
    
    return this;
  }
});
