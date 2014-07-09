// define the view Show
Articles.Views.Show = Backbone.View.extend({
  el: "body",
  
  
  template: JST["articles/templates/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var article = new Articles.Models.Article({id: options.id});
      article.fetch({
        success: function(fetchedArticle) {
          $(function() {
            console.log(fetchedArticle);
            that.$el.html(that.template({article: fetchedArticle}));
          });
        }
      });
    }
    
    return that;
  }
});
