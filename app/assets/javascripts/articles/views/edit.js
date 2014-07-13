// define the view "Edit"
Articles.Views.Edit = Backbone.View.extend({  
  el: "div#main_container",
  
  
  template: JST["articles/templates/edit"],
  
  
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
    
    var pictureEditor = new Articles.Views.Editors.PictureEditor({parentView: this});
    
    $(function() {
      $("#article_content").append(pictureEditor.render().el);
    });
  },
  
  
  getArticleForSave: function() {
    var editor = Articles.Helpers.Editor;
    
    this.model.set({
      "title": $("#article_title").val(),
      "author": $("#article_author").val(),
      "category": $("#article_category").val(),
      "content": editor.toContentJSON()
    });
    
    return this.model;
  },
  
  
  addPublishButton: function() {
    var publishButton = $("<button>Publish</button>");
    $("#article_edit_area").append(publishButton);
    publishButton.one("click", function() {
      publishButton.remove();
      alert("Published!!!!!!!!!!");
    });
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
          that.addPublishButton();
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
          
          that.addPublishButton();
        },
        error: function(unsavedArticle,response) {
          alert("Save failed!");
          that.render(unsavedArticle);
        }
      });
    });    
  }
});
