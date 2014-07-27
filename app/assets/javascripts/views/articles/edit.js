// define the view "Edit"
Articles.Views.Edit = Backbone.View.extend({  
  el: "div#main_container",
  
  
  template: JST["templates/articles/edit"],
  
  
  render: function(article) {
    var that = this;

    that.$el.html(that.template());
    
    article = article || new Articles.Models.Article();
    $("#article_title").val(article.get("title"));
    $("#article_author").val(article.get("author"));
    $("#article_category").val(article.get("category"));
    var articleContent = JSON.parse(article.get("content"));
    $("#article_content").empty();
    _.each(articleContent, function(articleParagraph) {
      if (articleParagraph.src) {
        if (articleParagraph.type === "text") {
          var textEditor = new Articles.Views.Editors.TextEditor();
          $("#article_content").append(textEditor.render(articleParagraph.src).el);
        } else if (articleParagraph.type === "picture") {
          var pictureEditor = new Articles.Views.Editors.PictureEditor();
          $("#article_content").append(pictureEditor.render(articleParagraph.src).el);
        }
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
  
  
  editArticle: function(id) {
    var that = this;
    
    var article = new Articles.Models.Article({id: id});
    article.fetch({
      success: function(fetchedArticle) {
        that.render(fetchedArticle);
      }
    });
  },
  
  
  events: {
    "click #article_add_text": "addText",
    "click #article_add_picture": "addPicture",
 
    "click #article_save": "save",
    "click #article_save_and_preview": "saveAndPreview",
    "click #article_save_and_publish": "saveAndPublish"
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
  
  
  getArticle: function() {    
    var articleContent = [];
    $(".Article_Editor").each(function(index) {
      var editor = $(this);
      var paragraph = editor.children(".Paragraph");
      var type = paragraph.data("type");

      if (type === "text") {
        var src = paragraph.html();
        if (src !== "") {
          var paragraphJSON = {
            "type": type,
            "src": src
          };
          articleContent.push(paragraphJSON);
        }
      }
      else if (type === "picture") {
        var img = paragraph.children("img");
        if (img.length > 0) {
          var paragraphJSON = {
            "type": type,
            "src": {
              "id": img.data("pictureId"),
              "url": img.attr("src")
            }
          };
          articleContent.push(paragraphJSON);
        }
      }
    });
    
    this.model.set({
      "title": $("#article_title").val(),
      "author": $("#article_author").val(),
      "category": $("#article_category").val(),
      "content": JSON.stringify(articleContent),
      "status": GlobalConstants.ArticleStatus.DRAFT
    });
    
    return this.model;
  },
  
  
  uploadAllPictures: function() {
    $(".Article_Editor").each(function(index) {
      var editor = $(this);
      var paragraph = editor.children(".Paragraph");
      var type = paragraph.data("type");

      if (type === "picture") {
        var img = paragraph.children("img");
        if (img.length === 0) {
          var uploadPictureInput = editor.children(".Upload_Picture");
          if (uploadPictureInput.length > 0 && uploadPictureInput.val() !== "") {
            editor.children(".Upload_Button").trigger("click");
          }
        }
      }
    });
  },
  
  
  allPicturesUploaded: function() {
    var allUploaded = true;
    $(".Article_Editor").each(function(index) {
      var editor = $(this);
      var paragraph = editor.children(".Paragraph");
      var type = paragraph.data("type");

      if (type === "picture") {
        var img = paragraph.children("img");
        if (img.length === 0) {
          allUploaded = false;
        }
      }
    });
    return allUploaded;
  },
  
  
  save: function(event, callback) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    var that = this;
    that.uploadAllPictures();
    
    function waitingForUpload() {
      if (that.allPicturesUploaded()) {
        var article = that.getArticle();
        article.save(article.toJSON(), {
          success: function(savedArticle) {
            if (callback) {
              callback(savedArticle);
            }
          },
          error: function(unsavedArticle,response) {
            alert("Save failed!");
            that.render(unsavedArticle);
          }
        });
      } else {
        setTimeout(waitingForUpload, 500);
      }
    }
    
    waitingForUpload();
  },
  
  
  preview: function(savedArticle) {
    var viewShow = new Articles.Views.Show({el: "div#popup_container"});
    viewShow.render({id: savedArticle.get("id"), preview: true});
    var popupContainer = $("#popup_container");
    var editArea = $("#article_edit_area");
    popupContainer.fadeIn("slow");
    editArea.css({"opacity": "0.3"});
    
    editArea.on("click", function() {
      editArea.off("click");
      popupContainer.fadeOut("slow");
      editArea.css({"opacity": "1.0"});
    });
  },
  
  
  saveAndPreview: function(event) {
    this.save(event, this.preview);
  },
  
  
  publish: function(savedArticle) {
    var viewPublish = new Articles.Views.Publish({article: savedArticle});
    viewPublish.render();
  },
  
  
  saveAndPublish: function(event) {
    this.save(event, this.publish);
  }
});
