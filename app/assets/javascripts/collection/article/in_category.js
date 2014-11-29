Collection.Article.InCategory = Backbone.Collection.extend({
  initialize: function(options) {
    this.categoryId = options.categoryId;
    this.batch = options.batch;
    this.articlesPerBatch = options.articlesPerBatch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/inCategory?" + $.param({
      batch: this.batch,
      articles_per_batch: this.articlesPerBatch,
      category_id: this.categoryId,
      page_load_time: this.pageLoadTime
    });
  }
});