// define the view Index
View.Article.Index = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/article/index"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.CoverCascade({fetchFunction: this.fetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  fetchFunction: function(batchToLoad, articlesPerBatch, fetchOptions, callbacks) {
    var articles = new Collection.Article.All({
      batch: batchToLoad,
      articlesPerBatch: articlesPerBatch,
      pageLoadTime: fetchOptions.pageLoadTime
    });
    articles.fetch(callbacks);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
