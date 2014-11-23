Collection.Article.ByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.batch = options.batch;
    this.articlesPerBatch = options.articlesPerBatch;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/byUser/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, user_id: this.userId});
  }
});