// define the view "Edit"
Articles.Views.Edit = Backbone.View.extend({  
  el: "div#main_container",
  
  
  template: JST["articles/templates/edit"],
  
  
  render: function(article) {
    var that = this;

    that.$el.html(that.template());
    $("button#article_save_and_publish").one("click", function(event) {
      that.saveAndPublish(event);   // publish event handler
    });
    
    article = article || new Articles.Models.Article();
    $("#article_title").val(article.get("title"));
    $("#article_author").val(article.get("author"));
    $("#article_category").val(article.get("category"));
    var articleContent = JSON.parse(article.get("content"));
    $("#article_content").empty();
    _.each(articleContent, function(articleParagraph) {
      if (articleParagraph.type === "text") {
        var textEditor = new Articles.Views.Editors.TextEditor();
        $("#article_content").append(textEditor.render(articleParagraph.src).el);
      } else if (articleParagraph.type === "picture") {
        var pictureEditor = new Articles.Views.Editors.PictureEditor();
        $("#article_content").append(pictureEditor.render(articleParagraph.src).el);
      }
    });
    that.model = article;    
    
    return that;
  },
  
  
  newArticle: function() {
    var that = this;
        
    var article = new Articles.Models.Article();
    article.save(article.toJSON(), {
      success: function(savedArticle) {
        that.render(savedArticle);
      }
    });
  },
  
  
  events: {
    "click #article_add_text": "addText",
    "click #article_add_picture": "addPicture",
 
    "click #article_save": "save",
    "click #article_save_and_preview": "saveAndPreview"
  },
  
  
  addText: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var textEditor = new Articles.Views.Editors.TextEditor();
    
    $(function() {
      $("#article_content").append(textEditor.render().el);
    });
  },
  
  
  addPicture: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var pictureEditor = new Articles.Views.Editors.PictureEditor({
      parentView: this,
      articleId: this.model.get("id")
    });
    
    $(function() {
      $("#article_content").append(pictureEditor.render().el);
    });
  },
  
  
  getArticleForSave: function() {
    var articleContent = [];
    $(".Article_Editor").each(function(index) {
      var editor = $(this);
      var paragraph = editor.children(".Paragraph");
      var type = paragraph.data("type");
      var src = paragraph.html();
      if (src !== "") {
        var paragraphJSON = {
          "type": type
        };
        if (type === "text") {
          paragraphJSON.src = src;
        }
        else if (type === "picture") {
          var img = paragraph.children("img");
          paragraphJSON.id = img.data("pictureId");
          paragraphJSON.url = img.attr("src");
        }
        articleContent.push(paragraphJSON);
      } else {
        if (type === "picture") {   // upload unsaved pictures.
          var uploadPictureInput = editor.children(".Upload_Picture");
          if (uploadPictureInput.val() !== "") {
            editor.children(".Upload_Button").trigger("click");
          }
        }
      }
    });
    
    this.model.set({
      "title": $("#article_title").val(),
      "author": $("#article_author").val(),
      "category": $("#article_category").val(),
      "content": JSON.stringify(articleContent),
      "published": false
    });
    
    return this.model;
  },
   
  
  save: function(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    var that = this;
    
    $(function() {
      var article = that.getArticleForSave();
      article.save(article.toJSON(), {
        success: function(savedArticle) {
          // @TODO: add success behavior.
        },
        error: function(unsavedArticle,response) {
          alert("Save failed!");
          that.render(unsavedArticle);
        }
      });
    });
  },
  
  
  saveAndPreview: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var that = this;
    
    $(function() {
      var article = that.getArticleForSave();
      article.save(article.toJSON(), {
        success: function(savedArticle) {
          var viewShow = new Articles.Views.Show({el: "div#popup_container"});
          viewShow.render({id: savedArticle.get("id"), preview: true});
          $("#popup_container").fadeIn("slow");
          $("#article_edit_area").css({"opacity": "0.3"});
          
          $("#article_edit_area").on("click", function() {
            $("#article_edit_area").off("click");
            $("#popup_container").fadeOut("slow");
            $("#article_edit_area").css({"opacity": "1.0"});
          });
        },
        error: function(unsavedArticle,response) {
          alert("Save failed!");
          that.render(unsavedArticle);
        }
      });
    });    
  },
  
  
  saveAndPublish: function(event) {
    event.preventDefault();
    event.stopPropagation();
    
    var that = this;
    
    $(function() {
      var article = that.getArticleForSave();
      article.set("published", true);
      article.save(article.toJSON(), {
        success: function(savedArticle) {
          var viewPublish = new Articles.Views.Publish({article: savedArticle});
          viewPublish.render();
          
          
          
          
          // var thumbPictures = [];
          // $(".Article_Editor").each(function(index) {
            // var paragraph = $(this).children(".Paragraph");
            // var type = paragraph.data("type");
            // var src = paragraph.html();
            // if (src !== "" && type === "picture") {
              // thumbPictures.push({
                // "id": paragraph.children("img").data("pictureId"),
                // "url": paragraph.children("img").data("thumbUrl")
              // });
            // }
          // });
//           
          // $("#popup_container").empty();
          // _.each(thumbPictures, function(pic) {
            // var thumbPic = $("<img></img>");
            // thumbPic.attr("src", pic.url);
            // thumbPic.data("pictureId", pic.id);
            // thumbPic.one("click", function(event) {
              // event.preventDefault();
              // event.stopPropagation();
              // savedArticle.set("cover_picture_url", thumbPic.attr("src"));
              // savedArticle.set("cover_picture_id", thumbPic.data("pictureId"));
              // savedArticle.save(savedArticle.toJSON());
              // $("#article_edit_area").off("click");
              // $("#popup_container").fadeOut("slow");
              // $("#article_edit_area").css({"opacity": "1.0"});
            // });
            // $("#popup_container").append(thumbPic);
          // });
          // var link = $("<a>choose a different picture as the cover</a>");
          // link.one("click", function() {
            // var coverPreview = $("<div id='cover_preview'></div>");
            // var pictureUploader = $("<input id='cover_picture' type='file' />");
            // var submit = $("<input type='button' id='cover_submit' value='Upload' />");
// 
            // $("#popup_container").empty();
            // $("#popup_container").append(coverPreview);
            // $("#popup_container").append(pictureUploader);
            // $("#popup_container").append(submit);
// 
            // submit.one("click", function(event) {
              // event.preventDefault();
              // event.stopPropagation();
//               
              // $(function() {
                // var formData = new FormData();
                // formData.append("picture[article_id]", that.model.get("id"));
                // formData.append("picture[src]", pictureUploader.get(0).files[0]);
//                 
                // var picture = new Articles.Models.Picture();
//                 
                // picture.save(formData, {
                  // progress: function(event) {
                    // if (event.lengthComputable) {
                      // $('progress').attr({
                        // value: event.loaded,
                        // max: event.total
                      // });
                    // }
                  // },
//                   
                  // beforeSend: function() {
                    // // var oldPictureHtml = contentContainer.children("img");
                    // // if (oldPictureHtml.length > 0) {
                      // // var oldPictureId = oldPictureHtml.data("pictureId");
                      // // var oldPicture = new Articles.Models.Picture({"id": oldPictureId});
                      // // oldPicture.destroy();
                    // // }
                    // coverPreview.append("<progress></progress>");
                  // },
//                   
                  // success: function(picture) {
                    // coverPreview.empty();
                    // coverPreview.append("<img src='" + picture.thumb_url + "' />");
                    // coverPreview.append("<h4>Successfully Changed the Cover Picture!</h4>");
                    // var article = that.model;
                      // article.set("cover_picture_url", picture.thumb_url);
                      // article.set("cover_picture_id", picture.id);
                      // article.save(article.toJSON());
                  // },
//                   
                  // error: function(jqXHR, textStatus, errorThrown) {},
//                   
                  // complete: function(jqXHR, textStatus ) {}
                // });
              // });
            // });
          // });
// 
          // $("#popup_container").append(link);
          // $("#popup_container").fadeIn("slow");
          // $("#article_edit_area").css({"opacity": "0.3"});
//           
          // $("#article_edit_area").on("click", function() {
            // $("#article_edit_area").off("click");
            // $("#popup_container").fadeOut("slow");
            // $("#article_edit_area").css({"opacity": "1.0"});
          // });
          
          
          
          
          
          
        },
        error: function(unsavedArticle,response) {
          alert("Save failed!");
          that.render(unsavedArticle);
        }
      });
    });
  },
});
