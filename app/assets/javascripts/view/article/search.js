// define the view Search
View.Article.Search = Backbone.View.extend({
  initialize: function(options) {
    this.keyword = options.keyword;
    
    _.bindAll(this, "articleFetchFunction");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/search"],


  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.Cascade.Main({articleFetchFunction: this.articleFetchFunction});
    this.viewArticleCascade.render();

    return this;
  },


  articleFetchFunction: function(batchToLoad, articlesPerBatch, options) {
    var articles = new Collection.Article.Search({
      keyword: this.keyword,
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
