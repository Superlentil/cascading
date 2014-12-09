Collection.Article.InCategory = Backbone.Collection.extend({
  initialize: function(options) {
    this.categoryId = options.categoryId;
    this.fetchSequenceNumber = options.fetchSequenceNumber,
    this.articlesPerFetch = options.articlesPerFetch,
    this.pageLoadTime = options.pageLoadTime;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/inCategory?" + $.param({
      fetch_sequence_number: this.fetchSequenceNumber,
      articles_per_fetch: this.articlesPerFetch,
      category_id: this.categoryId,
      page_load_time: this.pageLoadTime
    });
  }
});