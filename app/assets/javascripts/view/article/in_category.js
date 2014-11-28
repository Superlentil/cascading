// define the view InCategory
View.Article.InCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "fetchFunction");
    
    this.categoryId = options.categoryId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/in_category"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.CoverCascade({fetchFunction: this.fetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  fetchFunction: function(batchToLoad, articlesPerBatch, options) {
    var articles = new Collection.Article.InCategory({
      categoryId: this.categoryId,
      batch: batchToLoad,
      articlesPerBatch: articlesPerBatch
    });
    articles.fetch(options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
