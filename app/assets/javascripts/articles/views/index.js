// define the view "Index"
Articles.Views.Index = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["articles/templates/index"],
  
  
  render: function() {
    var that = this;
    
    var articles = new Articles.Collections.Article();
    articles.fetch({
      success: function(articles) {
        $(function() {
          that.$el.html(that.template({articles: articles.models, contentJsonToHtml: that.contentJsonToHtml}));
        }); 
      }
    });
    
    return this;
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
