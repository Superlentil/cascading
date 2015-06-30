Collection.Article.ByUserAndCategory = Collection.Article.CoverCascade.extend({
  initializeHelper: function(options) {
    this.urlParams["user_id"] = options.userId;
    this.urlParams["category_id"] = options.categoryId;
  },


  url: function() {
    return GlobalConstant.DOMAIN + "/articles/byUserAndCategory.json/?" + $.param(this.urlParams);
  }
});