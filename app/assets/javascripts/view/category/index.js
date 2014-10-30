View.Category.Index = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/category/index"],
  
  
  render: function() {
    var that = this;
    
    var allCategories = GlobalVariable.Article.AllCategories;
    if (allCategories) {
      that.$el.html(that.template({allCategories: allCategories.models, userId: null}));
    } else {
      allCategories = new Collection.Category.All();
      allCategories.fetch({
        success: function(fetchedCategories) {
          that.$el.html(that.template({allCategories: allCategories.models, userId: null}));
        }
      });
    }
       
    return that;
  }
});
