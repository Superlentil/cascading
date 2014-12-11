Collection.Article.Index = Collection.Article.CoverCascade.extend({
  initialize: function(options) {
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  url: function() {
    return "/articles/?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      page_load_time: this.pageLoadTime
    });
  }
});