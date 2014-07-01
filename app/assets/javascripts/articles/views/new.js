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
      article.save(
        {
          "title": $("#article_title").val(),
          "author": $("#article_author").val(),
          "category": $("#article_category").val(),
          "content": $("#article_content").val()
        },
        {
          success: function(article) {
            Backbone.history.navigate('', {trigger:true});
          },
          error: function(article,response) {
            console.log(response);
          }
        }
      );
    });
  }
});
