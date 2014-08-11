View.Layout.Forbidden = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/layout/forbidden"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  }
});
