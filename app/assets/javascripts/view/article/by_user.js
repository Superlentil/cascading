// define the view ByUser
View.Article.ByUser = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "articleFetchFunction");
    
    this.userId = options.userId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/by_user"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.Cascade.Main({articleFetchFunction: this.articleFetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  articleFetchFunction: function(batchToLoad, countPerBatch, options) {
    var articles = new Collection.Article.ByUser();
    articles.fetchBatch(batchToLoad, countPerBatch, this.userId, options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
