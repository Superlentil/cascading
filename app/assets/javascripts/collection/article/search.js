Collection.Article.Search = Collection.Article.CoverCascade.extend({
  initialize: function(options) {
    this.keyword = options.keyword;
    this.fetchSequenceNumber = options.fetchSequenceNumber;
    this.articlesPerFetch = options.articlesPerFetch;
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  url: function() {
    return "/articles/search?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      keyword: this.keyword,
      page_load_time: this.pageLoadTime
    });
  }
});