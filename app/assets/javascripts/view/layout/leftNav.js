View.Layout.LeftNav = Backbone.View.extend({
  el: "#layout-leftNav",
  
  
  template: JST["template/layout/leftNav"],
  
  
  render: function() {
    this.$el.html(this.template());
  }
});
