Collection.Article.All = Backbone.Collection.extend({
  initialize: function(options) {
    this.batch = options.batch;
    this.articlesPerBatch = options.articlesPerBatch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, page_load_time: this.pageLoadTime});
  }
});