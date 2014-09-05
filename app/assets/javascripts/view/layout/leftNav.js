View.Layout.LeftNav = Backbone.View.extend({
  initialize: function(options) {   
    this.closeNavHandler = options.closeNavHandler;
  },
  
  
  tagName: "div",
  id: "layout-leftNav-content",
  className: "container",
  
  
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
  },
  
  
  events: {
    "click .layout-leftNav-closeNav": "onCloseNav"
  },
  
  
  onCloseNav: function(event) {
    this.closeNavHandler();
  }
});
