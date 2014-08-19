// define the view "Index.Cover"
View.Article.Index.Cover = Backbone.View.extend({
  initialize: function(options) {
    this.article = options.article;
  },
  
  
  tagName: "div",
  className: "article-index-cover",
  
  
  template: JST["template/article/index/cover"],
  
  
  render: function(hCoordinate, vCoordinate) {
    this.$el.html(this.template({article: this.article}));
    this.$el.css({"top": hCoordinate + "px", "left": vCoordinate + "px"});
    return this;
  }
});