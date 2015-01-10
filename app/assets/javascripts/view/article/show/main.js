// define the view Show
View.Article.Show.Main = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    this.articleParagraph = [];
    this.isGalleryOptionOn = false;
    this.galleryParagraphIndex = 0;
    this.galleryCurrentParagraph = null;
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
          that.$el.html(that.template({article: fetchedArticle, articleContent: that.parseArticleContent(fetchedArticle), preview: isPreview}));
          
          if (!isPreview) {
            $(".Delete_Article").one("click", function(event) {
              that.deleteArticle(event);
            });
            
            // header sub title
            var id = fetchedArticle.get("id");
            var title = fetchedArticle.get("title");
            that.articleTitle = title;
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
  
  
  parseArticleContent: function(article) {
    var articleParagraph = [];
    var index = 0;
    
    if (article.get("cover_picture_imported")) {
      articleParagraph.push({type: "picture", src: {url: article.get("cover_picture_url").replace("/thumb/", "/medium/")}});
      ++index;
    }

    var contentObj = JSON.parse(article.get("content"));
    var contentHtml = "";
        
    _.each(contentObj, function(paragraph) {
      articleParagraph.push(paragraph);
      if (paragraph.type === "text") {
        contentHtml += "<pre class='article-show-text-container'>" + paragraph.src + "</pre>";
        ++index;
      } else if (paragraph.type === "picture") {
        contentHtml += "<pre class='article-show-picture-container'><img class='article-show-picture' src='"
          + paragraph.src.url
          + "' data-paragraph-index='"
          + index
          + "'></pre>";
          
        ++index;
      }
    });
    
    this.articleParagraph = articleParagraph;
    return contentHtml;
  },
  
  
  events: {
    "click .article-show-picture": "openGallery",
    "click #article-show-gallery-content": "galleryOption",
    "click #article-show-gallery-close": "closeGallery",
    "click #article-show-gallery-prev": "prevGalleryImage",
    "click #article-show-gallery-next": "nextGalleryImage"
  },
  
  
  openGallery: function(event) {
    event.preventDefault();
    
    var galleryContainer = this.galleryContainer;
    if (galleryContainer.length > 0) {
      this.galleryParagraphIndex = parseInt($(event.currentTarget).data("paragraphIndex"));
      this.galleryCurrentParagraph = $(
        "<div class='article-show-gallery-content-wrapper'>"
        + this.galleryParagraph(this.galleryParagraphIndex)
        + "</div>"
      );
      GlobalVariable.Layout.Header.Hide(0);
      galleryContainer.html(this.galleryTemplate());
      $("#article-show-gallery-content").append(this.galleryCurrentParagraph);
      galleryContainer.fadeIn("slow");
    }    
  },
  
  
  galleryParagraph: function(paragraphIndex) {
    var paragraphCount = this.articleParagraph.length;
    if (paragraphIndex < -1) {
      return null;
    } else if (paragraphIndex === -1) {
      return "<div class='article-show-gallery-title'>" + this.articleTitle + "</div>";
    } else if (paragraphIndex < paragraphCount) {
      var paragraph = this.articleParagraph[paragraphIndex];
      if (paragraph.type === "text") {
        return "<div class='article-show-gallery-text'>" + paragraph.src + "</div>";
      } else if (paragraph.type === "picture") {
        return "<img class='article-show-gallery-picture' src='" + paragraph.src.url + "'>";
      }
    } else if (paragraphIndex === paragraphCount) {
      
    } else {
      return null;
    }
  },
  
  
  galleryOption: function(event) {
    if (this.isGalleryOptionOn) {
      this.isGalleryOptionOn = false;
      $("#article-show-gallery-main").transition({y: 0});
    } else {
      this.isGalleryOptionOn = true;
      $("#article-show-gallery-main").transition({y: "-30%"});
    }
  },
  
  
  closeGallery: function(event) {
    event.preventDefault();
    
    this.isGalleryOptionOn = false;
    this.galleryCurrentParagraph = null;
    GlobalVariable.Layout.Header.Show("slow");
    this.galleryContainer.fadeOut("slow");
  },
  
  
  prevGalleryImage: function(event) {
    var current = this.galleryCurrentParagraph;
    var prevParagraphIndex = this.galleryParagraphIndex - 1;
    var prevContent = this.galleryParagraph(prevParagraphIndex);
    current.prevAll().remove();
    current.nextAll().remove();
    if (prevContent) {
      this.galleryParagraphIndex = prevParagraphIndex;
      var prev = $("<div class='hide article-show-gallery-content-wrapper'>" + prevContent + "</div>");
      current.before(prev);
      current.transition({x: "100%", scale: 0}, 600);
      prev.fadeIn(600);
      this.galleryCurrentParagraph = prev;
    } else {
      current.transition({x: "30%"}, 400).transition({x: 0}, 400);
    }
  },
  
  
  nextGalleryImage: function(event) {
    var current = this.galleryCurrentParagraph;
    var nextParagraphIndex = this.galleryParagraphIndex + 1;
    var nextContent = this.galleryParagraph(nextParagraphIndex);
    current.prevAll().remove();
    current.nextAll().remove();
    if (nextContent) {
      this.galleryParagraphIndex = nextParagraphIndex;
      var next = $("<div class='hide article-show-gallery-content-wrapper'>" + nextContent + "</div>");
      current.after(next);
      current.transition({x: "-100%", scale: 0}, 600);
      next.fadeIn(600);
      this.galleryCurrentParagraph = next;
    } else {
      current.transition({x: "-30%"}, 400).transition({x: 0}, 400);
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
