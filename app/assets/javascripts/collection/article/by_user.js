Collection.Article.ByUser = Collection.Article.CoverCascade.extend({
  initializeHelper: function(options) {
    this.urlParams["user_id"] = options.userId;
  },
  
  
  url: function() {
    return GlobalUtilities.PathToUrl("/articles/byUser?" + $.param(this.urlParams));
  }
});