Views.Layouts.RightNav = Backbone.View.extend({
  el: "#layouts-rightNav",
  
  
  template: JST["templates/layouts/rightNav"],
  
  
  render: function() {
    this.$el.html(this.template());
  }
});
