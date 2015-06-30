Collection.Article.ByUser = Collection.Article.CoverCascade.extend({
  initializeHelper: function(options) {
    this.urlParams["user_id"] = options.userId;
  },
  
  
  url: function() {
    return GlobalConstant.DOMAIN + "/articles/byUser.json/?" + $.param(this.urlParams);
  }
});