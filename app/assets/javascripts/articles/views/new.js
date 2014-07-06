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
    "click #article_add_text": "addText",
    "click #article_add_picture": "addPicture",
 
    "click #article_submit": "saveArticle"
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
    
    $(function() {
      var article = new Articles.Model();
      var editor = Articles.Helpers.Editor;
      
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
