Collection.Article.ByUserAndCategory = Collection.Article.CoverCascade.extend({
  initialize: function(options) {
    this.userId = options.userId;
    this.categoryId = options.categoryId;
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  url: function() {
    return "/articles/byUserAndCategory/?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      user_id: this.userId,
      category_id: this.categoryId,
      page_load_time: this.pageLoadTime
    });
  }
});