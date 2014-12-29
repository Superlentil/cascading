// define the view Show
View.Article.Show.Main = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/show/main"],
  
  
  render: function(options) {
    var that = this;
    var isPreview = options.preview;
    
    if (options.id) {
      var article = new Model.Article({id: options.id});
      article.fetch({
        success: function(fetchedArticle) {
          that.$el.html(that.template({article: fetchedArticle, contentJsonToHtml: that.contentJsonToHtml, preview: isPreview}));
          
          if (!isPreview) {
            $(".Delete_Article").one("click", function(event) {
              that.deleteArticle(event);
            });
            
            // header sub title
            var id = fetchedArticle.get("id");
            var title = fetchedArticle.get("title");
            var titleLink = "<a href='#/article/" + id + "' title = '" + title + "'>" + title + "</a>";
            GlobalVariable.Layout.Header.UpdateSubTitle(titleLink);
            
            // browsing history
            var historyArticle = {};
            historyArticle.id = id;
            historyArticle.title = title;
            historyArticle.author = fetchedArticle.get("author");
            historyArticle.authorUserId = fetchedArticle.get("user_id");
            historyArticle.abstract = fetchedArticle.get("abstract");
            GlobalVariable.BrowsingHistory.push(historyArticle);
            
            // recommend
            var viewRecommendCascade = new View.Article.Show.Recommend({
              articleContainer: $("#article-show-content"),
              regularRecommendContainer: $("#article-show-recommend-regular"),
              articleId: fetchedArticle.get("id"),
              category: fetchedArticle.get("category_name")
            });
            that.allSubviews.push(viewRecommendCascade);
            viewRecommendCascade.render();
            that.viewRecommendCascade = viewRecommendCascade;
            
            // comment
            var viewComment = new View.Article.Show.Comment({articleId: options.id});
            that.allSubviews.push(viewComment);
            viewComment.render();
          }
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
        Backbone.history.navigate("#", {trigger: true});
      },
      error: function() {
        alert("Delete article failed. Please try it again. Thanks!");
        Backbone.history.navigate("#", {trigger: true});
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
      var articleContainer = $("#article-show");
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
  
  
  onWidthChange: function() {
    if (this.viewRecommendCascade) {
      this.viewRecommendCascade.onWidthChange();
    }
  },
  
  
  remove: function() {
    $(".Delete_Article").off("click");
    $("#article-show").off("click");
    
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
