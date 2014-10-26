Collection.Article.InCategory = Backbone.Collection.extend({
  initialize: function(options) {
    this.categoryId = options.categoryId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/inCategory?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, category_id: this.categoryId});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    
    this.fetch(options);
  }
});