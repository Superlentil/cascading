Articles.Collections.Articles = Backbone.Collection.extend({
  model: Articles.Models.Article,
  
  
  url: function() {
    return "/articles/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    
    this.fetch(options);
  }
});