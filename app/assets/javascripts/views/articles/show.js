// define the view Show
Views.Articles.Show = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["templates/articles/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var article = new Models.Articles.Article({id: options.id});
      article.fetch({
        success: function(fetchedArticle) {
          that.$el.html(that.template({article: fetchedArticle, contentJsonToHtml: that.contentJsonToHtml, preview: options.preview}));
          
          $(".Delete_Article").one("click", function(event) {
            that.deleteArticle(event);
          });
        }
      });
    }
       
    return that;
  },
  
  
  deleteArticle: function(event) {
    event.preventDefault();
    
    var id = $(event.currentTarget).data("articleId");
    var article = new Models.Articles.Article({id: id});
    article.destroy({
      success: function() {
        Backbone.history.navigate("", {trigger: true});
      },
      error: function() {
        alert("Delete article failed. Please try it again. Thanks!");
        Backbone.history.navigate("", {trigger: true});
      }
    });
  },
  
  
  contentJsonToHtml: function(articleContent) {
    var contentObj = JSON.parse(articleContent);
    var contentHtml = "<div>";
    _.each(contentObj, function(paragraph) {
      if (paragraph.type === "text") {
        contentHtml += "<pre>" + paragraph.src + "</pre>";
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre><img src='" + paragraph.src.url + "' class='Article_Picture' /></pre>";
      }
    });
    contentHtml += "</div>";
    return contentHtml;
  },
  
  
  events: {
    "click .Article_Picture": "showOriginalPicture"
  },
  
  
  showOriginalPicture: function(event) {
    event.preventDefault();
    
    var popupContainer = $("#popup_container");
    if (popupContainer.length > 0) {
      var picture = $(event.currentTarget);
      var articleContainer = $("#article_content_container");
      popupContainer.html("<img src='" + picture.attr("src").replace("/medium/", "/original/") + "' />");
      popupContainer.fadeIn("slow");
      articleContainer.css({"opacity": "0.3"});
      
      articleContainer.on("click", function() {
        articleContainer.off("click");
        popupContainer.fadeOut("slow");
        articleContainer.css({"opacity": "1.0"});
      });
    }    
  }
});
