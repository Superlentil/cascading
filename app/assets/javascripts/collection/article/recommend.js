Collection.Article.Recommend = Backbone.Collection.extend({
  initialize: function(options) {
    this.articleId = options.articleId;
    this.category = options.category;
    this.random = options.random;
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/recommend?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      article_id: this.articleId,
      category: this.category,
      random: this.random
    });
  }
});