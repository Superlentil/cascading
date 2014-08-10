// define the view "Edit"
View.Article.Edit = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    _.bindAll(this, 'preview');
    _.bindAll(this, 'publish');
  },
  
  
  el: "div#main_container",
  
  
  template: JST["template/article/edit"],
  
  
  render: function(article) {
    var that = this;

    that.$el.html(that.template());
    
    article = article || new Model.Article.Article();
    $("#article_title").val(article.get("title"));
    $("#article_author").val(article.get("author"));
    $("#article_category").val(article.get("category"));
    var articleContent = JSON.parse(article.get("content"));
    $("#article_content").empty();
    _.each(articleContent, function(articleParagraph) {
      if (articleParagraph.src) {
        if (articleParagraph.type === "text") {
          var textEditor = new View.Article.Editor.TextEditor();
          that.allSubviews.push(textEditor);   // prevent view memory leak
          $("#article_content").append(textEditor.render(articleParagraph.src).el);
        } else if (articleParagraph.type === "picture") {
          var pictureEditor = new View.Article.Editor.PictureEditor({
            parentView: that,
            articleId: article.get("id")
          });
          that.allSubviews.push(pictureEditor);   // prevent view memory leak
          $("#article_content").append(pictureEditor.render(articleParagraph.src).el);
        }
      }
    });
    that.model = article;    
    
    return that;
  },
  
  
  newArticle: function() {
    var that = this;
      
    if ($.cookie("user_id")) {  
      var article = new Model.Article.Article();
      article.set({
        "author": $.cookie("user_nickname"),
        "user_id": $.cookie("user_id")
      });
      
      article.save(article.toJSON(), {
        success: function(savedArticle) {
          that.render(savedArticle);
        }
      });
    } else {
      Backbone.history.navigate("", {trigger: true});
    }
  },
  
  
  editArticle: function(id) {
    var that = this;
    
    var article = new Model.Article.Article({id: id});
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
    
    var textEditor = new View.Article.Editor.TextEditor();
    this.allSubviews.push(textEditor);   // prevent view memory leak
    
    $(function() {
      $("#article_content").append(textEditor.render().el);
    });
  },
  
  
  addPicture: function(event) {
    event.preventDefault();
    
    var pictureEditor = new View.Article.Editor.PictureEditor({
      parentView: this,
      articleId: this.model.get("id")
    });
    this.allSubviews.push(pictureEditor);   // prevent view memory leak
    
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
      "category": $("#article_category").val(),
      "content": JSON.stringify(articleContent),
      "status": GlobalConstant.ArticleStatus.DRAFT
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
    var viewShow = new View.Article.Show({el: "div#popup_container"});
    this.allSubviews.push(viewShow);   // prevent view memory leak

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
    var viewPublish = new View.Article.Publish({article: savedArticle});
    this.allSubviews.push(viewPublish);   // prevent view memory leak
    
    viewPublish.render();
  },
  
  
  saveAndPublish: function(event) {
    this.save(event, this.publish);
  },
  
  
  remove: function() {
    $("#article_edit_area").off("click");
    
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
