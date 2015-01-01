View.Category.Index = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "renderHelper");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/category/index"],
  
  
  render: function() {
    GlobalVariable.Layout.LeftNav.FetchAllCategories({success: this.renderHelper});

    return this;
  },
  
  
  renderHelper: function() {
    this.$el.html(this.template({allCategories: GlobalVariable.Article.AllCategories.models, userId: null}));
  }
});
