Collection.Article.Search = Backbone.Collection.extend({
  initialize: function(options) {
    this.keyword = options.keyword;
    this.batch = options.batch;
    this.articlesPerBatch = options.articlesPerBatch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/search?" + $.param({
      batch: this.batch,
      articles_per_batch: this.articlesPerBatch,
      keyword: this.keyword,
      page_load_time: this.pageLoadTime
    });
  }
});