Collection.Article.CoverCascade = Backbone.Collection.extend({
  initialize: function(options) {
    this.urlParams = {
      fetch_sequence_number: options.fetchSequenceNumber,
      articles_per_fetch: options.articlesPerFetch,
      page_load_time: options.pageLoadTime,
      sort_by: options.sortBy
    };
    
    this.initializeHelper(options);
  },
  
  
  initializeHelper: function(options) {
  },
  
  
  model: Model.Article,
  
  
  parse: function(rawResponse, options) {
    this.pageLoadTime = rawResponse.page_load_time;
    return rawResponse.article_covers;
  },
});