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
    
    var allCategories = new Collection.Category.All();
    allCategories.fetch({
      success: function(fetchedCategories) {
        that.$el.html(that.template({categories: fetchedCategories.models}));
        GlobalVariable.Article.AllCategories = fetchedCategories;
        
        that.searchInput = $("#layout-leftNav-search-input");
      }
    });
    
    return that;
  },
  
  
  events: {
    "click .layout-leftNav-alsoCloseNav": "onAlsoCloseNav",
    "click #layout-leftNav-search-button": "search"
  },
  
  
  onAlsoCloseNav: function(event) {
    this.closeNavHandler();
  },
  
  
  search: function(event) {
    event.preventDefault();
    var keyword = this.searchInput.val();
    if (keyword.length > 0) {
      Backbone.history.navigate("#/articles/search/" + keyword, {trigger: true});
    }
  }
});
