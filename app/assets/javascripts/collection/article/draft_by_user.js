Collection.Article.DraftByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return "/articles/draftByUser/?" + $.param({user_id: this.userId});
  }
});