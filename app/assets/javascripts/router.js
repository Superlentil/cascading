// define the articles "Router"
Router = Backbone.Router.extend({
  routes: {  
    "": "allArticles",
    "article/:id": "showArticle",
    
    "users": "allUsers",
    "users/new": "newUser",
    "user/:id": "showUser",
    "user/:id/edit": "editUser",
    "user/:id/articles": "allUserArticles",
    "user/:id/articles/new": "newArticle",
    "user/:userId/article/:articleId/edit": "editArticle",
    
    "*others": "allArticles"
  },
  
  
  execute: function(callback, args) {
    $(window).off("scroll");
    if (callback) callback.apply(this, args);
  },

  
  allArticles: function() {
    var viewIndex = new Articles.Views.Index.Main();
    viewIndex.render();
  },
  
  
  showArticle: function(id) {
    var viewShow = new Articles.Views.Show();
    viewShow.render({id: id});
  },

  
  'new': function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 100) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new Articles.Views.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
    } else {
      // @TODO: need a better action for too frequent "new" page load.
      this.navigate('', {trigger: true});
    }
  },
   
  
  edit: function(id) {
    var viewEdit = new Articles.Views.Edit();
    viewEdit.editArticle(id);
  }
});

