//= require_tree ./editors


// define the view "New"
Articles.Views.New = Backbone.View.extend({
  el: "body",
  
  
  template: JST["articles/templates/new"],
  
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
    return this;
  },
  
  
  events: {
    "click #article_add_paragraph": "addParagraph",
    "click .Move_Up_Button": "moveUpEditor",
    "click .Move_Down_Button": "moveDownEditor",
    "click #article_submit": "saveArticle"
  },
  
  
  addParagraph: function(event) {
    event.preventDefault();
    event.stopPropagation();
    console.log(this);
    
    var viewTextEditor = new Articles.Views.Editors.TextEditor();
    
    $(function() {
      $("#article_content").append(viewTextEditor.render().el);
    });
  },
  
  
  moveUpEditor: function(event) {
    var editor = $(event.currentTarget).parent();
    editor.prev("div.Article_Paragraph_Editor").before(editor);
  },
  
  
  moveDownEditor: function(event) {
    var editor = $(event.currentTarget).parent();
    editor.next("div.Article_Paragraph_Editor").after(editor);
  },
  
  
  saveArticle: function(event) {   
    event.preventDefault();
    event.stopPropagation();
    
    $(function() {
      var article = new Articles.Model();
      var editor = Articles.Utilities.Editor;
      
      article.set({
          "title": $("#article_title").val(),
          "author": $("#article_author").val(),
          "category": $("#article_category").val(),
          "content": editor.toContentJSON()
      });
            
      article.save(article.toJSON(), {
        success: function(article) {
          Backbone.history.navigate('', {trigger:true});
        },
        error: function(article,response) {
          console.log(response);
        }
      });
    });
  }
});
