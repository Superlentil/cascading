// define the view "New"
Articles.Views.New = Backbone.View.extend({
  initialize: function(article) {
    this.model = article || new Articles.Models.Article();
  },
  
  
  el: "body",
  
  
  template: JST["articles/templates/new"],
  
  
  render: function() {
    this.$el.html(this.template());
    return this;
  },
  
  
  renderArticle: function(article) {
    $(function() {
      article = article || new Articles.Models.Article();
      $("#article_title").val(article.title);
      $("#article_author").val(article.author);
      $("#article_category").val(article.category);
      var articleContent = JSON.parse(article.content);
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
      this.model = article;
    });
  },
  
  
  events: {
    "click #article_add_text": "addText",
    "click #article_add_picture": "addPicture",
 
    "click #article_save": "saveArticle",
    "click #article_save_and_view": "saveAndViewArticle"
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
    
    var pictureEditor = new Articles.Views.Editors.PictureEditor();
    
    $(function() {
      $("#article_content").append(pictureEditor.render().el);
    });
  },
  
  
  saveArticle: function(event) {    
    event.preventDefault();
    event.stopPropagation();
    
    var that = this;
    
    $(function() {
      var article = that.model;
      var editor = Articles.Helpers.Editor;
      
      article.set({
          "title": $("#article_title").val(),
          "author": $("#article_author").val(),
          "category": $("#article_category").val(),
          "content": editor.toContentJSON()
      });
            
      article.save(article.toJSON(), {
        success: function(article) {
          that.render();
          that.renderArticle(article.attributes);
        },
        error: function(article,response) {
          console.log(response);
        }
      });
    });
  },
  
  
  viewArticle: function(event) {
    
  }
});
