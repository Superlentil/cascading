Collection.Article.CoverCascade = Backbone.Collection.extend({
  model: Model.Article,
  
  
  parse: function(rawResponse, options) {
    console.log(rawResponse);
    this.pageLoadTime = rawResponse.page_load_time;
    return rawResponse.article_covers;
  },
});