Collection.Article.Index = Collection.Article.CoverCascade.extend({
  url: function() {
    return GlobalConstant.DOMAIN + "/articles.json/?" + $.param(this.urlParams);
  }
});