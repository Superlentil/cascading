// define the view ByUserAndCategory
View.Article.ByUserAndCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "articleFetchFunction");
    
    this.userId = options.userId;
    this.categoryId = options.categoryId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/by_user_and_category"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.Cascade.Main({articleFetchFunction: this.articleFetchFunction});
    this.viewArticleCascade.render();

    return this;
  },
  
  
  articleFetchFunction: function(batchToLoad, countPerBatch, options) {
    var articles = new Collection.Article.ByUserAndCategory({userId: this.userId, categoryId: this.categoryId});
    articles.fetchBatch(batchToLoad, countPerBatch, options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
