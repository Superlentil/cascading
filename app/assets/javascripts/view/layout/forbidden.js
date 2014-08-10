View.Layout.Forbidden = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["template/layout/forbidden"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
