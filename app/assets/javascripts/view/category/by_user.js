View.Category.ByUser = Backbone.View.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/category/by_user"],
  
  
  render: function() {
    var that = this;
    
    var allCategoriesByUser = new Collection.Category.ByUser({userId: that.userId});
    allCategoriesByUser.fetch({
      success: function(fetchedCategories) {
        that.$el.html(that.template({userId: that.userId, allCategories: allCategoriesByUser.models}));
      }
    });

    return that;
  }
});
