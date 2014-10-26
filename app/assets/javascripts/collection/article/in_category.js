Collection.Article.InCategory = Backbone.Collection.extend({
  model: Model.Article,
  
  
  url: function() {
    return "/articles/inCategory?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, category_id: this.categoryId});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, categoryId, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    this.categoryId = categoryId;
    
    this.fetch(options);
  }
});