Collection.Article.Article = Backbone.Collection.extend({
  model: Model.Article.Article,
  
  
  url: function() {
    return "/articles/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    
    this.fetch(options);
  }
});