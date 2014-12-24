// define the view InCategory
View.Article.InCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "fetchFunction");
    
    this.categoryId = options.categoryId;
    this.sortBy = options.sortBy;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/in_category"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.CoverCascade({fetchFunction: this.fetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.InCategory({
      categoryId: this.categoryId,
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      pageLoadTime: fetchOptions.pageLoadTime,
      sortBy: this.sortBy
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
