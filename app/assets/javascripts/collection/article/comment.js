Collection.Article.Comment = Backbone.Collection.extend({
  model: Model.Article.Comment,
  
  
  url: function() {
    return "/comments/?" + $.param({article_id: this.articleId});
  },
  
  
  fetchForArticle: function(articleId, options) {
    this.articleId = articleId;
    
    this.fetch(options);
  }
});