Collection.Article.InCategory = Collection.Article.CoverCascade.extend({
  initializeHelper: function(options) {
    this.urlParams["category_id"] = options.categoryId;
  },
  
  
  url: function() {
    return GlobalConstant.DOMAIN + "/articles/inCategory.json?" + $.param(this.urlParams);
  }
});