// define the view Show
View.Article.Show.Main = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    this.isGalleryOptionOn = false;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/show/main"],
  galleryTemplate: JST["template/article/show/gallery"],
  
  
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
            
            that.galleryContainer = $("#article-show-gallery");
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
        contentHtml += "<pre class='article-show-text-container'>" + paragraph.src + "</pre>";
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre class='article-show-picture-container'><img src='" + paragraph.src.url + "' class='article-show-picture' /></pre>";
      }
    });
    return contentHtml;
  },
  
  
  events: {
    "click .article-show-picture": "openGallery",
    "click #article-show-gallery-img": "galleryOption",
    "click #article-show-gallery-close": "closeGallery"
  },
  
  
  openGallery: function(event) {
    event.preventDefault();
    
    var galleryContainer = this.galleryContainer;
    if (galleryContainer.length > 0) {
      GlobalVariable.Layout.Header.Hide(0);
      // galleryContainer.html("<img src='" + $(event.currentTarget).attr("src").replace("/medium/", "/original/") + "' />");
      galleryContainer.html(this.galleryTemplate());
      galleryContainer.fadeIn("slow");
    }    
  },
  
  
  galleryOption: function(event) {
    if (this.isGalleryOptionOn) {
      this.isGalleryOptionOn = false;
      $("#article-show-gallery-img").transition({y: 0});
    } else {
      this.isGalleryOptionOn = true;
      $("#article-show-gallery-img").transition({y: "-30%"});
    }
  },
  
  
  closeGallery: function(event) {
    event.preventDefault();
    
    this.isGalleryOptionOn = false;
    GlobalVariable.Layout.Header.Show("slow");
    this.galleryContainer.fadeOut("slow");
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
