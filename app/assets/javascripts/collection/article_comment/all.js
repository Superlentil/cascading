Collection.ArticleComment.All = Backbone.Collection.extend({
  model: Model.Comment,
  
  
  url: function() {
    return GlobalUtilities.PathToUrl("/comments?" + $.param({article_id: this.articleId}));
  },
  
  
  fetchForArticle: function(articleId, options) {
    this.articleId = articleId;
    
    this.fetch(options);
  }
});