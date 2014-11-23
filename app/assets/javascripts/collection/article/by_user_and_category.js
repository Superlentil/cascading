Collection.Article.ByUserAndCategory = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.categoryId = options.categoryId;
    this.batch = options.batch;
    this.articlesPerBatch = options.articlesPerBatch;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/byUserAndCategory/?" + $.param({batch: this.batch,
      articles_per_batch: this.articlesPerBatch,
      user_id: this.userId,
      category_id: this.categoryId
    });
  }
});