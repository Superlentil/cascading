View.Article.BrowsingHistory = Backbone.View.extend({
  tagName: "div",
  id: "article-browsing-history",
  className: "container",
  template: JST["template/article/browsing_history"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  events: {
    "click .m-close-popup": "closePopup"
  },
  
  
  closePopup: function(event) {
    GlobalVariable.Layout.ViewPopup.closePopup();
  }
});