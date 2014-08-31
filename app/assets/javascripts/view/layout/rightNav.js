View.Layout.RightNav = Backbone.View.extend({
  tagName: "div",
  className: "container",
  
  
  template: JST["template/layout/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
