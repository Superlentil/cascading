Collection.Article.DraftByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Article,
  
  
  url: function() {
    return GlobalConstant.DOMAIN + "/articles/draftByUser.json/?" + $.param({user_id: this.userId});
  }
});