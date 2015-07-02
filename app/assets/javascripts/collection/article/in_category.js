Collection.Article.InCategory = Collection.Article.CoverCascade.extend({
  initializeHelper: function(options) {
    this.urlParams["category_id"] = options.categoryId;
  },
  
  
  url: function() {
    return GlobalUtilities.PathToUrl("/articles/inCategory?" + $.param(this.urlParams));
  }
});