Collections.Articles.Comments = Backbone.Collection.extend({
  model: Models.Articles.Comment,
  
  
  url: function() {
    return "/comments/?" + $.param({article_id: this.articleId});
  },
  
  
  fetchForArticle: function(articleId, options) {
    this.articleId = articleId;
    
    this.fetch(options);
  }
});