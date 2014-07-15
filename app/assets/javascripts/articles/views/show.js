// define the view Show
Articles.Views.Show = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["articles/templates/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var article = new Articles.Models.Article({id: options.id});
      article.fetch({
        success: function(fetchedArticle) {
          $(function() {
            that.$el.html(that.template({article: fetchedArticle, contentJsonToHtml: that.contentJsonToHtml, preview: options.preview}));
          });
        }
      });
    }
    
    return that;
  },
  
  
  contentJsonToHtml: function(articleContent) {
    var contentObj = JSON.parse(articleContent);
    var contentHtml = "<div>";
    _.each(contentObj, function(paragraph) {
      if (paragraph.type === "text") {
        contentHtml += "<pre>" + paragraph.src + "</pre>";
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre><img src='" + paragraph.url + "' /></pre>";
      }
    });
    contentHtml += "</div>";
    return contentHtml;
  }
});
