Views.Layouts.Footer = Backbone.View.extend({
  el: "div#main_footer",
  
  
  template: JST["templates/layouts/footer"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }  
});
