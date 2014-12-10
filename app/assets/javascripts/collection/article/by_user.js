Collection.Article.ByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/byUser/?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      user_id: this.userId,
      page_load_time: this.pageLoadTime
    });
  }
});