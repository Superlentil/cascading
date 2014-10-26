Collection.Article.ByUserAndCategory = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.categoryId = options.categoryId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/byUserAndCategory/?" + $.param({batch: this.batch,
      articles_per_batch: this.articlesPerBatch,
      user_id: this.userId,
      category_id: this.categoryId
    });
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    
    this.fetch(options);
  }
});