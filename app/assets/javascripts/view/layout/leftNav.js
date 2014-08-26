View.Layout.LeftNav = Backbone.View.extend({
  tagName: "div",
  className: "container-fluid",
  
  
  template: JST["template/layout/leftNav"],
  
  
  render: function() {
    var that = this;
    
    var allCategories = new Collection.Article.AllCategory();
    allCategories.fetch({
      success: function(fetchedCategories) {
        that.$el.html(that.template({categories: fetchedCategories.models}));
      }
    });
    
    return that;
  }
});
