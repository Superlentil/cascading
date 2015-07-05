// define the view "publish"
View.Article.Publish = Backbone.View.extend({
  initialize: function(options) {
    this.article = options.article;
    this.mode = "unknown";
    this.resetCoverPicture();
  },


  resetCoverPicture: function() {
    this.coverPictureId = -1;
    this.coverPictureUrl = "";
    this.coverPictureImported = false;
  },


  el: "#layout-content",


  template: JST["template/article/publish"],


  render: function() {
    var that = this;

    var allContentPictures = this.getAllContentPictures();
    this.$el.html(this.template({
      coverPictureId: this.article.get("cover_picture_id"),
      coverPictureUrl: this.article.get("cover_picture_url"),
      coverPictureImported: (this.article.get("cover_picture_imported") ? "yes" : "no"),
      contentPictures: allContentPictures
    }));

    $("#confirm_button").one("click", function() {
      that.publish({"hasCoverPicture": true});
    });
    $("#skip_button").one("click", function() {
      that.publish();
    });
  },


  getAllContentPictures: function() {
    var pictures = [];
    articleContent = JSON.parse(this.article.get("content"));
    _.each(articleContent, function(paragraph) {
      if (paragraph.type === "picture") {
        pictures.push({
          id: paragraph.src.id,
          url: GlobalUtilities.PathToUrl(paragraph.src.url.replace("/medium/", "/thumb/"))
        });
      }
    });
    return pictures;
  },


  publish: function(options) {
    var hasCoverPicture = false;
    if (options) {
      hasCoverPicture = options.hasCoverPicture ? true : false;
    }

    if (hasCoverPicture && this.coverPictureId < 0) {
      alert("Please choose or upload a cover picture first.");
    } else {
      var article = this.article;
      if (!hasCoverPicture) {
        this.resetCoverPicture();
      }
      article.set("status", GlobalConstant.Article.Status.PUBLIC_PUBLISHED);
      article.set("cover_picture_id", this.coverPictureId);
      article.set("cover_picture_url", this.coverPictureUrl);
      article.set("cover_picture_imported", this.coverPictureImported);
      article.save(article.toJSON(), {
        success: function(savedArticle) {
          Backbone.history.navigate("#/article/" + savedArticle.get("id"), {trigger: true});
        },

        error: function(unsavedArticle) {
          alert("Publish failed. Please try it again. Thanks!");
          Backbone.history.loadUrl("#/article/" + unsavedArticle.get("id") + "/edit");
        }
      });
    }
  },


  events: {
    "click #choose_cover_picture_container": "chooseCoverPictureMode",
    "click #upload_cover_picture_container": "uploadCoverPictureMode",

    "click .article-publish-thumb-picture": "chooseCover",
    "click #upload_picture_button": "uploadCover",
    "click #cancel_button": "cancelPublish"
  },


  chooseCoverPictureMode: function(event) {
    $("#choose_cover_picture_container").css({"opacity": "1.0"});
    $("#upload_preview").hide();
    $("#new_cover_picture").val("");
    $("#upload_cover_picture_container").css({"opacity": "0.3"});
    if (this.mode !== "choose") {
      this.resetCoverPicture();
    }
  },


  uploadCoverPictureMode: function(event) {
    $("#upload_preview").show();
    $("#upload_cover_picture_container").css({"opacity": "1.0"});
    $("#choose_cover_picture_container").css({"opacity": "0.3"});
    $(".article-publish-thumb-picture").css({"margin-bottom": "1em", "border": "0px none"});
    if (this.mode === "upload") {
      var previewPicture = $("#upload_preview").children("img");
      if (previewPicture.length > 0) {
        this.coverPictureId = previewPicture.data("pictureId");
        this.coverPictureUrl = previewPicture.attr("src");
        this.coverPictureImported = true;
      } else {
        this.resetCoverPicture();
      }
    } else {
      this.resetCoverPicture();
    }
  },


  chooseCover: function(event) {
    event.preventDefault();
    var that = this;

    var picture = $(event.currentTarget);
    that.coverPictureUrl = picture.attr("src");
    that.coverPictureId = picture.data("pictureId");
    that.coverPictureImported = (picture.data("imported") === "yes");
    that.mode = "choose";
    $(".article-publish-thumb-picture").css({"margin-bottom": "1em", "border": "0px none"});
    picture.css({"border": "0px outset pink"}).animate({
      "margin-bottom": "0",
      "border-width": "5px"
    });
  },


  uploadCover: function(event) {
    console.log("starting upload cover");
    event.preventDefault();
    var that = this;

    var formData = new FormData();
    formData.append("picture[article_id]", that.article.get("id"));
    formData.append("picture[src]", $("#new_cover_picture").get(0).files[0]);

    var picture = new Model.Picture();
    var progressBar = $("<progress></progress>");
    var uploadPreviewContainer = $("#upload_preview");

    picture.save(formData, {
      progress: function(event) {
        if (event.lengthComputable) {
          progressBar.attr({
            value: event.loaded,
            max: event.total
          });
        }
      },

      beforeSend: function() {
        uploadPreviewContainer.empty();
        uploadPreviewContainer.append(progressBar);
      },

      success: function(savedPicture) {
        uploadPreviewContainer.empty();
        uploadPreviewContainer.append("<img src='" + savedPicture.thumb_url
          + "' alt='Cover Picture' data-picture-id='" + savedPicture.id
          + "' data-imported='no' />"
        );
        that.coverPictureUrl = savedPicture.thumb_url;
        that.coverPictureId = savedPicture.id;
        that.coverPictureImported = true;
        that.mode = "upload";
      },

      error: function(jqXHR, textStatus, errorThrown) {},

      complete: function(jqXHR, textStatus ) {}
    });
  },


  cancelPublish: function() {
    Backbone.history.loadUrl("#/article/" + this.article.get("id") + "/edit");
  },


  remove: function() {
    $("#confirm_button").off("click");
    $("#skip_button").off("click");

    Backbone.View.prototype.remove.call(this);
  }
});
