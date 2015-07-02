View.Article.DraftByUser = Backbone.View.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/draft_by_user"],
  
  
  render: function() {
    var that = this;
    
    if (parseInt(that.userId) === parseInt($.cookie("user_id"))) {
      var draftsByUser = new Collection.Article.DraftByUser({userId: that.userId});
      draftsByUser.fetch({
        success: function(fetchedDrafts) {
          that.$el.html(that.template({allDrafts: fetchedDrafts.models, getPictureUrl: that.getPictureUrl, getText: that.getText}));
          
          $(".article-draft-delete").one("click", function(event) {
            that.deleteArticle(event);
          });
        }
      });
    } else {
      Backbone.history.loadUrl("forbidden");
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
  
  
  getPictureUrl: function(articleDraft) {
    var pictureUrl = GlobalUtilities.PathToUrl(articleDraft.get("cover_picture_url")) || "";
    if (pictureUrl.length === 0) {
      var contentObj = JSON.parse(articleDraft.get("content"));
      pictureUrl = _.find(contentObj, function(paragraph) {
        return paragraph.type === "picture";
      });
      if (pictureUrl) {
        pictureUrl = pictureUrl.src.url.replace("/medium/", "/thumb/");
      } else {
        pictureUrl = PrecompiledAsset.Picture.DefaultArticleDraftPicture;
      }
    }
    return pictureUrl;
  },
  
  
  getText: function(articleDraft) {
    var contentObj = JSON.parse(articleDraft.get("content"));
    text = _.find(contentObj, function(paragraph) {
      return paragraph.type === "text";
    });
    if (text) {
      text = text.src;
      if (text.length > 300) {
        return text.substring(0, 300) + " ...";
      } else {
        return text;
      }
    } else {
      text = "< no text content >";
    }
    return text;
  },
  
  
  remove: function() {
    $(".article-draft-delete").off("click");
    
    Backbone.View.prototype.remove.call(this);
  }
});
