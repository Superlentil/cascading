// define the view "Edit"
View.Article.Edit = Backbone.View.extend({
  initialize: function() {
    this.allSubviews = [];
    _.bindAll(this, 'preview');
    _.bindAll(this, 'publish');
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/edit"],
  
  
  render: function(article) {
    var that = this;

    var allCategories = GlobalVariable.Article.AllCategories;
    if (allCategories) {
      that.renderHelper(article, allCategories);
    } else {
      allCategories = new Collection.Category.All();
      allCategories.fetch({
        success: function(fetchedCategories) {
          that.renderHelper(article, allCategories);
        }
      });
    }
    
    return that;
  },
  
  
  renderHelper: function(article, allCategories) {
    var that = this;
    
    that.$el.html(that.template({allCategories: allCategories.models}));
    var addEditorContainer = $("#article-edit-add-editor-container");
    var viewAddEditor = new View.Article.Editor.AddEditor({
      articleEditView: this,
      enableMinimize: false,
      addBeforeElement: addEditorContainer
    });
    that.allSubviews.push(viewAddEditor);
    addEditorContainer.html(viewAddEditor.render().$el);
    
    article = article || new Model.Article();
    article.unset("created_at", { silent: true });
    article.unset("updated_at", { silent: true });
    that.model = article; 
    
    $("#article-edit-title").val(article.get("title"));
    $("#article_author").val(article.get("author"));
    var articleCategoryId = article.get("category_id") || -1;
    $("#article-edit-category").val(articleCategoryId);
    var articleContent = JSON.parse(article.get("content"));
    _.each(articleContent, function(articleParagraph) {
      if (articleParagraph.src) {
        if (articleParagraph.type === "text") {
          that.addText(addEditorContainer, articleParagraph.src);
        } else if (articleParagraph.type === "picture") {
          that.addPicture(addEditorContainer, articleParagraph.src);
        }
      }
    });
  },
  
  
  newArticle: function() {
    var that = this;
      
    if ($.cookie("user_id")) {  
      var article = new Model.Article();
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
    
    var article = new Model.Article({id: id});
    article.fetch({
      success: function(fetchedArticle) {
        that.render(fetchedArticle);
      }
    });
  },
  
  
  events: {
    "click #article-edit-save": "save",
    "click #article-edit-save-preview": "saveAndPreview",
    "click #article-edit-save-publish": "saveAndPublish"
  },
  
  
  addText: function(addBeforeElement, content) {
    var textEditor = new View.Article.Editor.TextEditor({
      articleEditView: this
    });
    this.allSubviews.push(textEditor);   // prevent view memory leak
    
    addBeforeElement.before(textEditor.render(content).el);
  },
  
  
  addPicture: function(addBeforeElement, content) {
    var pictureEditor = new View.Article.Editor.PictureEditor({
      articleEditView: this,
      articleId: this.model.get("id")
    });
    this.allSubviews.push(pictureEditor);   // prevent view memory leak
    
    addBeforeElement.before(pictureEditor.render(content).el);
  },
  
  
  getArticle: function() {    
    var articleContent = [];
    $(".article-edit-editor").each(function(index) {
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
        var allImages = paragraph.children("img");
        if (allImages.length > 0) {
          allImages.each(function() {
            var img = $(this);
            var paragraphJSON = {
              "type": type,
              "src": {
                "id": img.data("pictureId"),
                "url": img.attr("src")
              }
            };
            articleContent.push(paragraphJSON);
          });
        }
      }
    });
    
    var categorySelector = $("#article-edit-category");
    var categoryId = parseInt(categorySelector.val());
    var categoryName = "";
    if (categoryId > 0) {
      categoryName = categorySelector.children(":selected").text();
    }
    
    this.model.set({
      "title": $("#article-edit-title").val(),
      "category_id": categoryId,
      "category_name": categoryName,
      "content": JSON.stringify(articleContent),
      "status": GlobalConstant.ArticleStatus.DRAFT
    });
    
    return this.model;
  },
  
  
  uploadAllPictures: function() {
    $(".article-edit-editor").each(function(index) {
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
    $(".article-edit-editor").each(function(index) {
      var editor = $(this);
      var paragraph = editor.children(".Paragraph");
      var type = paragraph.data("type");

      if (type === "picture") {
        var uploadPictureInput = editor.children(".Upload_Picture");
        var img = paragraph.children("img");
        if (img.length === 0 && uploadPictureInput.val() !== "") {
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
        setTimeout(waitingForUpload, 200);
      }
    }
    
    waitingForUpload();
  },
  
  
  preview: function(savedArticle) {
    var viewShow = new View.Article.Show({el: "div#popup_container"});
    this.allSubviews.push(viewShow);   // prevent view memory leak

    viewShow.render({id: savedArticle.get("id"), preview: true});
    var popupContainer = $("#popup_container");
    var editArea = $("#article-edit-container");
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
    $("#article-edit-container").off("click");
    
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
