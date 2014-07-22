// define the view "Index.Cover"
Articles.Views.Index.Cover = Backbone.View.extend({
  initialize: function(options) {
    this.article = options.article;
  },
  
  
  tagName: "div",
  className: "Article_Cover",
  
  
  template: JST["articles/templates/index/cover"],
  
  
  render: function(hCoordinate, vCoordinate) {
    this.$el.html(this.template({article: this.article}));
    this.$el.css({"width": "213px", "margin": "0", "padding": "10px", "border": "1px solid", "position": "absolute", "top": hCoordinate + "px", "left": vCoordinate + "px"});
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