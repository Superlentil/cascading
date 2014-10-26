// define the view InCategory
View.Article.InCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "articleFetchFunction");
    
    this.categoryId = options.categoryId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/in_category"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.Cascade.Main({articleFetchFunction: this.articleFetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  articleFetchFunction: function(batchToLoad, countPerBatch, options) {
    var articles = new Collection.Article.InCategory();
    articles.fetchBatch(batchToLoad, countPerBatch, this.categoryId, options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
