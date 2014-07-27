// define the articles "Router"
Router = Backbone.Router.extend({
  routes: {  
    "": "articles",
    "articles/new": "newArticle",
    "article/:id": "showArticle",
    "article/:id/edit": "editArticle",
    
    "users": "users",
    "users/new": "newUser",
    "user/:id": "showUser",
    "user/:id/edit": "editUser",
    "user/:id/articles": "userArticles",
    
    "*others": "allArticles"
  },
  
  
  execute: function(callback, args) {
    $(window).off("scroll");
    if (callback) callback.apply(this, args);
  },

  
  articles: function() {
    var viewIndex = new Articles.Views.Index.Main();
    viewIndex.render();
  },
  
  
  newArticle: function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 100) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new Articles.Views.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
    } else {
      // @TODO: need a better action for too frequent "new" page load.
      this.loadUrl('');
    }
  },
  
  
  showArticle: function(id) {
    var viewShow = new Articles.Views.Show();
    viewShow.render({id: id});
  },
  
  
  editArticle: function(id) {
    var viewEdit = new Articles.Views.Edit();
    viewEdit.editArticle(id);
  },
  
  
  users: function() {

  },
  
  
  showUser: function() {
    
  },
  
  
  editUser: function() {
    
  },
  
  
  userArticles: function() {
    
  }
});
