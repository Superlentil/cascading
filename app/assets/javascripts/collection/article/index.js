Collection.Article.Index = Collection.Article.CoverCascade.extend({
  url: function() {
    return GlobalUtilities.PathToUrl("/articles?" + $.param(this.urlParams));
  }
});