// define the view Show
View.Article.Show = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var article = new Model.Article({id: options.id});
      article.fetch({
        success: function(fetchedArticle) {
          that.$el.html(that.template({article: fetchedArticle, contentJsonToHtml: that.contentJsonToHtml, preview: options.preview}));
          
          $(".Delete_Article").one("click", function(event) {
            that.deleteArticle(event);
          });
          
          var viewComment = new View.Article.Comment({articleId: options.id});
          that.allSubviews.push(viewComment);
          viewComment.render();
        }
      });
    }
       
    return that;
  },
  
  
  deleteArticle: function(event) {
    event.preventDefault();
    
    var id = $(event.currentTarget).data("articleId");
    var article = new Model.Article({id: id});
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
    var contentHtml = "";
    _.each(contentObj, function(paragraph) {
      if (paragraph.type === "text") {
        contentHtml += "<pre class='article-show-text'>" + paragraph.src + "</pre>";
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre class='article-show-picture'><img src='" + paragraph.src.url + "' class='Article_Picture' /></pre>";
      }
    });
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
      var articleContainer = $("#article-show-container");
      popupContainer.html("<img src='" + picture.attr("src").replace("/medium/", "/original/") + "' />");
      popupContainer.fadeIn("slow");
      articleContainer.css({"opacity": "0.3"});
      
      articleContainer.on("click", function() {
        articleContainer.off("click");
        popupContainer.fadeOut("slow");
        articleContainer.css({"opacity": "1.0"});
      });
    }    
  },
  
  
  remove: function() {
    $(".Delete_Article").off("click");
    $("#article-show-container").off("click");
    
    var subview;
    while (this.allSubviews.length > 0) {
      subview = this.allSubviews.pop();
      if (subview) {
        subview.remove();
      }
    }
    
    Backbone.View.prototype.remove.call(this);
  }
});
