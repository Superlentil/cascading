View.Layout.LeftNav = Backbone.View.extend({
  tagName: "div",
  
  
  template: JST["template/layout/leftNav"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
