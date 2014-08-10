View.Layout.RightNav = Backbone.View.extend({
  el: "#layout-rightNav",
  
  
  template: JST["template/layout/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
  }
});
