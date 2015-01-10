// define the view Show
View.Article.Show.Main = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    this.articleParagraph = [];
    this.isGalleryOptionOn = false;
    this.galleryCurrentParagraphIndex = 0;
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
    "click #article-show-gallery-next": "nextGalleryImage",
    "click #article-show-gallery-details": "showGalleryDetails"
  },
  
  
  openGallery: function(event) {
    event.preventDefault();
    
    var galleryContainer = this.galleryContainer;
    if (galleryContainer.length > 0) {
      this.galleryCurrentParagraphIndex = parseInt($(event.currentTarget).data("paragraphIndex"));
      GlobalVariable.Layout.Header.Hide(0);
      galleryContainer.html(this.galleryTemplate({paragraph: this.galleryParagraph(this.galleryCurrentParagraphIndex)}));
      this.galleryCurrentParagraph = $(".article-show-gallery-content-outer-wrapper");
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
        return "<img class='article-show-gallery-img' src='" + paragraph.src.url + "'>";
      }
    } else if (paragraphIndex === paragraphCount) {
      var recommendItems = this.viewRecommendCascade.getRegularRecommendItems();
      var itemCount = recommendItems.length;
      var recommendContent = "";
      for (var index = 0; index < itemCount; ++index) {
        var item = recommendItems[index];
        if (item) {
          recommendContent += "<div class='col-xs-6 col-sm-3 article-show-recommend-regular-item'>"
            + "<a class='article-show-recommend-regular-pic-link' href='#/article/" + item.id + "'>"
            + "<div class='article-show-recommend-regular-pic' style=\"background: url('" + item.picUrl + "') no-repeat center center; background-size: 100% auto;\"></div>"
            + "</a>"
            + "<h5><a href='#/article/" + item.id + "'>" + item.title + "</a></h5>"
          + "</div>";
        }
      }
      return recommendContent;
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
    var prevParagraphIndex = this.galleryCurrentParagraphIndex - 1;
    var prevContent = this.galleryParagraph(prevParagraphIndex);
    current.prevAll().remove();
    current.nextAll().remove();
    if (prevContent) {
      var prevParagraph = $(prevContent);
      prevParagraph.addClass("hide");
      var prevInnerWrapper = $("<div class='article-show-gallery-content-inner-wrapper'></div>");
      prevInnerWrapper.append(prevParagraph);
      var prevOuterWrapper = $("<div class='article-show-gallery-content-outer-wrapper'></div>");
      prevOuterWrapper.append(prevInnerWrapper);
      this.galleryCurrentParagraphIndex = prevParagraphIndex;
      current.before(prevOuterWrapper);
      current.transition({x: "100%", scale: 0}, 600);
      prevParagraph.fadeIn(600);
      this.galleryCurrentParagraph = prevOuterWrapper;
    } else {
      current.transition({x: "30%"}, 400).transition({x: 0}, 400);
    }
  },
  
  
  nextGalleryImage: function(event) {
    var current = this.galleryCurrentParagraph;
    var nextParagraphIndex = this.galleryCurrentParagraphIndex + 1;
    var nextContent = this.galleryParagraph(nextParagraphIndex);
    current.prevAll().remove();
    current.nextAll().remove();
    if (nextContent) {
      var nextParagraph = $(nextContent);
      nextParagraph.addClass("hide");
      var nextInnerWrapper = $("<div class='article-show-gallery-content-inner-wrapper'></div>");
      nextInnerWrapper.append(nextParagraph);
      var nextOuterWrapper = $("<div class='article-show-gallery-content-outer-wrapper'></div>");
      nextOuterWrapper.append(nextInnerWrapper);
      this.galleryCurrentParagraphIndex = nextParagraphIndex;
      current.after(nextOuterWrapper);
      current.transition({x: "-100%", scale: 0}, 600);
      nextParagraph.fadeIn(600);
      this.galleryCurrentParagraph = nextOuterWrapper;
    } else {
      current.transition({x: "-30%"}, 400).transition({x: 0}, 400);
    }
  },
  
  
  showGalleryDetails: function(event) {
    var paragraphCount = this.articleParagraph.length;
    var index = this.galleryCurrentParagraphIndex;
    if (index >=0 && index < paragraphCount) {
      var paragraph = this.articleParagraph[index];
      if (paragraph.type === "picture") {
        var container = this.galleryCurrentParagraph.find(".article-show-gallery-content-inner-wrapper");
        container.html("<img class='article-show-gallery-img' src='" + paragraph.src.url.replace("/medium/", "/original/") + "'>");
      }
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
