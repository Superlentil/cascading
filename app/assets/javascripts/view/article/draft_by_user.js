View.Article.DraftByUser = Backbone.View.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/draft_by_user"],
  
  
  render: function() {
    var that = this;
    
    if (that.userId === parseInt($.cookie("user_id"))) {
      var draftsByUser = new Collection.Article.DraftByUser({userId: that.userId});
      draftsByUser.fetch({
        success: function(fetchedDrafts) {
          that.$el.html(that.template({allDrafts: fetchedDrafts.models}));
        }
      });
    } else {
      Backbone.history.loadUrl("forbidden");
    }

    return that;
  }
});
