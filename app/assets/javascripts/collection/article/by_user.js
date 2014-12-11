Collection.Article.ByUser = Collection.Article.CoverCascade.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  url: function() {
    return "/articles/byUser/?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      user_id: this.userId,
      page_load_time: this.pageLoadTime
    });
  }
});