Collection.Article.DraftByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return GlobalUtilities.PathToUrl("/articles/draftByUser?" + $.param({user_id: this.userId}));
  }
});