// define the view "New"
Article.View.New = Backbone.View.extend({
  el: 'body',
  
  template: JST['articles/templates/new'],
  
  events: {
    "click #article_submit": "saveArticle"
  },
  
  render: function() {
    var that = this;
    that.$el.html(that.template());
  },
  
  saveArticle: function(event) {   
    event.preventDefault();
    event.stopPropagation();
    
    $(function() {
      var article = new Article.Model();
      var editor = Article.Utility.Editor;
      
      article.set({
          "title": $("#article_title").val(),
          "author": $("#article_author").val(),
          "category": $("#article_category").val(),
          "content": editor.toJSON("text", $("#article_content").val())
      });
      
      console.log(article);
      console.log(article.toJSON());
      
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
