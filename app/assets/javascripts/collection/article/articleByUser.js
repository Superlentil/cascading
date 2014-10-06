Collection.Article.ArticleByUser = Backbone.Collection.extend({
  model: Model.Article.Article,
  
  
  url: function() {
    return "/articles/byUser/?" + $.param({batch: this.batch, articles_per_batch: this.articlesPerBatch, user_id: this.userId});
  },
  
  
  fetchBatch: function(batch, articlesPerBatch, userId, options) {
    this.batch = batch;
    this.articlesPerBatch = articlesPerBatch;
    this.userId = userId;
    
    this.fetch(options);
  }
});