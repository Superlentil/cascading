// define the articles "Router"
Router = Backbone.Router.extend({
  routes: {  
    "": "articles",
    "article/:id": "showArticle",
    "article/:id/edit": "editArticle",
    
    "users": "users",
    "users/new": "newUser",
    "user/:id": "showUser",
    "user/:id/edit": "editUser",
    
    "user/:id/articles": "userArticles",
    "user/:id/articles/new": "userNewArticle",
    
    "*others": "allArticles"
  },
  
  
  execute: function(callback, args) {
    $(window).off("scroll");
    
    var layoutHeader = new Views.Layouts.Header();
    var layoutFooter = new Views.Layouts.Footer();
    layoutHeader.render();
    layoutFooter.render();
    
    if (callback) callback.apply(this, args);
  },

  
  articles: function() {
    var viewIndex = new Views.Articles.Index.Main();
    viewIndex.render();
  },
  
   
  showArticle: function(id) {
    var viewShow = new Views.Articles.Show();
    viewShow.render({id: id});
  },
  
  
  editArticle: function(id) {
    var viewEdit = new Views.Articles.Edit();
    viewEdit.editArticle(id);
  },
  
  
  users: function() {

  },
  
  
  newUser: function() {
    var viewNew = new Views.Users.New();
    viewNew.render();
  },
  
  
  showUser: function(id) {
    var viewShow = new Views.Users.Show();
    viewShow.render({id: id});
  },
  
  
  editUser: function() {
    
  },
  
  
  userArticles: function() {
    
  },
  
  
  userNewArticle: function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 100) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new Views.Articles.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
    } else {
      // @TODO: need a better action for too frequent "new" page load.
      this.loadUrl('');
    }
  }
});
