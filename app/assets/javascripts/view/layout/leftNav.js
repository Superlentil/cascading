View.Layout.LeftNav = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "fetchAllCategories");
    _.bindAll(this, "renderHelper");
    
    GlobalVariable.Layout.LeftNav.FetchAllCategories = this.fetchAllCategories;
  },
  
  
  tagName: "nav",
  id: "layout-leftNav",
  attributes: {"role": "navigation"},
  
  
  template: JST["template/layout/leftNav"],
  
  
  fetchAllCategories: function(callbacks, callBackOptions) {
    var that = this;
    
    if (GlobalVariable.Article.AllCategories) {
      if (callbacks) {
        var successCallBackOptions = null;
        if (callBackOptions) {
          successCallBackOptions = callBackOptions.success;
        }
        callbacks.success(successCallBackOptions);
      }
    } else {
      var allCategories = new Collection.Category.All();
      allCategories.fetch({
        success: function(fetchedCategories) {
          GlobalVariable.Article.AllCategories = allCategories;
          var successCallBackOptions = null;
          if (callBackOptions) {
            successCallBackOptions = callBackOptions.success;
          }
          callbacks.success(successCallBackOptions);
        }
      });
    }
  },
  
  
  render: function() {
    this.fetchAllCategories({success: this.renderHelper});
    
    return this;
  },
  
  
  renderHelper: function() {
    this.$el.html(this.template({categories: GlobalVariable.Article.AllCategories.models}));   
    this.searchInput = $("#layout-leftNav-search-input");
  },
  
  
  events: {
    "click #layout-leftNav-logo": "clickLogo",
    
    "click .m-close-nav": "onCloseNav",
    "click #layout-leftNav-search-button": "search",
    "keyup #layout-leftNav-search-input": "enterToSearch",
  },
  
  
  clickLogo: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#", {trigger: true});
  },
  
  
  onCloseNav: function(event) {
    GlobalVariable.Layout.CloseNavHandler();
  },
  
  
  search: function(event) {
    event.preventDefault();
    var keyword = this.searchInput.val();
    if (keyword.length > 0) {
      Backbone.history.navigate("#/articles/search/" + keyword, {trigger: true});
    }
  },
  
  
  enterToSearch: function(event) {
    if (event.keyCode === 13) {
      this.search(event);
    }
  }

});
