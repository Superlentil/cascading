Views.Layouts.Forbidden = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["templates/layouts/forbidden"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
