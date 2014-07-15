// define the view "publish"
Articles.Views.Publish = Backbone.View.extend({
  initialize: function(options) {
    this.article = options.article;
  },
  
  
  el: "div#main_container",
  
  
  template: JST["articles/templates/publish"],
  
  
  render: function() {
    var allPictures = this.getAllPictures();
    this.$el.html(this.template({pictures: allPictures}));
  },
  
  
  getAllPictures: function() {
    var pictures = [];
    articleContent = JSON.parse(this.article.get("content"));
    _.each(articleContent, function(paragraph) {
      if (paragraph.type === "picture") {
        pictures.push({
          id: paragraph.id,
          url: paragraph.url.replace("/medium/", "/thumb/")
        });
      }
    });
    return pictures;
  }
});
