Views.Layouts.LeftNav = Backbone.View.extend({
  el: "#layouts-leftNav",
  
  
  template: JST["templates/layouts/leftNav"],
  
  
  render: function() {
    this.$el.html(this.template());
  }
});
