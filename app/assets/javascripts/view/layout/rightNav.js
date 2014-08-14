View.Layout.RightNav = Backbone.View.extend({
  tagName: "div",
  className: "col-xs-12",
  
  
  template: JST["template/layout/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
