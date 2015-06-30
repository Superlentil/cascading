Collection.ArticleComment.All = Backbone.Collection.extend({
  model: Model.Comment,
  
  
  url: function() {
    return GlobalConstant.DOMAIN + "/comments.json/?" + $.param({article_id: this.articleId});
  },
  
  
  fetchForArticle: function(articleId, options) {
    this.articleId = articleId;
    
    this.fetch(options);
  }
});