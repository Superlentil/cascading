// define the view "Index"
Articles.Views.Index = Backbone.View.extend({
  initialize: function() {
    _.bindAll(this, 'handleScroll');
    $(window).on("scroll", this.handleScroll);
  },
  
  
  el: "div#main_container",
  
  
  template: JST["articles/templates/index"],
  
  
  render: function() {
    var that = this;
    
    var articles = new Articles.Collections.Article();
    articles.fetch({
      success: function(articles) {
        that.$el.html(that.template({articles: articles.models, contentJsonToHtml: that.contentJsonToHtml}));
        
        $(".Delete_Article").one("click", function(event) {
          that.deleteArticle(event);
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
        contentHtml += "<pre><img src='" + paragraph.src.url + "' /></pre>";
      }
    });
    contentHtml += "</div>";
    return contentHtml;
  },
  
  
  deleteArticle: function(event) {
    event.preventDefault();
    
    var id = $(event.currentTarget).data("articleId");
    var article = new Articles.Models.Article({id: id});
    article.destroy({
      success: function() {
        Backbone.history.loadUrl("");
      },
      error: function() {
        alert("Delete article failed. Please try it again. Thanks!");
        Backbone.history.loadUrl("");
      }
    });
  },
  
  
  handleScroll: function(event) {
    var thisWindow = $(window);
    if (thisWindow.scrollTop() + thisWindow.height() + 500 > $(document).height()) {
      alert("To the bottom!!!!!!");
    }
  }
});
