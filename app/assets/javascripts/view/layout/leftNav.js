View.Layout.LeftNav = Backbone.View.extend({
  tagName: "div",
  className: "col-xs-12",
  
  
  template: JST["template/layout/leftNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
