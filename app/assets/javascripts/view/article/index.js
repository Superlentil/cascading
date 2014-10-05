// define the view Index
View.Article.Index = Backbone.View.extend({
  el: "#layout-content",
  
  
  template: JST["template/article/index"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewArticleCascade = new View.Article.Cascade.Main();
    this.viewArticleCascade.render();

    return this;
  },
  
  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
