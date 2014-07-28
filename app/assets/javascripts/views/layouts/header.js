Views.Layouts.Header = Backbone.View.extend({
  el: "div#main_header",
  
  
  template: JST["templates/layouts/header"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }  
});
