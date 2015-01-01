Collection.Article.Index = Collection.Article.CoverCascade.extend({
  url: function() {
    return "/articles/?" + $.param(this.urlParams);
  }
});