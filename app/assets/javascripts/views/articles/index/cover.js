// define the view "Index.Cover"
Views.Articles.Index.Cover = Backbone.View.extend({
  initialize: function(options) {
    this.article = options.article;
  },
  
  
  tagName: "div",
  className: "Article_Cover",
  
  
  template: JST["templates/articles/index/cover"],
  
  
  render: function(hCoordinate, vCoordinate) {
    this.$el.html(this.template({article: this.article}));
    this.$el.css({"width": "215px", "margin": "0", "padding": "10px", "background-color": "#ebfffd", "position": "absolute", "top": hCoordinate + "px", "left": vCoordinate + "px"});
    return this;
  },
  
  
  events: {
    "click img.Cover_Picture": "showArticle"
  },
  
  
  showArticle: function(event) {
    event.preventDefault();
    
    Backbone.history.navigate("article/" + this.article.get("id"), {trigger: true});
  }
});