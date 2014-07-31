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
    var that = this;
    
    // console.log("router -> execute");
    if (this.lastView) {
      that.lastView.remove();
    }
    if (this.layoutHeader) {
      that.layoutHeader.remove();
    }
    if (this.layoutFooter) {
      that.layoutFooter.remove();
    }
    
    $(function() {
      $("body").empty();
      $("body").append("<div id='main_header'></div>");
      $("body").append("<div id='main_container'></div>");
      $("body").append("<div id='main_footer'></div>");
      
      that.layoutHeader = new Views.Layouts.Header();
      that.layoutFooter = new Views.Layouts.Footer();
      that.layoutHeader.render();
      that.layoutFooter.render();
      
      if (callback) {
        that.lastView = callback.apply(that, args);
      }
    });
  },

  
  articles: function() {
    var viewIndex = new Views.Articles.Index.Main();
    viewIndex.render();
    return viewIndex;
  },
  
  
  newArticle: function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 100) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new Views.Articles.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
      return viewEdit;
    } else {
      // @TODO: need a better action for too frequent "new" page load.
      this.loadUrl('');
    }
  },
  
   
  showArticle: function(id) {
    var viewShow = new Views.Articles.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  editArticle: function(id) {
    var viewEdit = new Views.Articles.Edit();
    viewEdit.editArticle(id);
    return viewEdit;
  },
  
  
  users: function() {

  },
  
  
  newUser: function() {
    var viewNew = new Views.Users.New();
    viewNew.render();
    return viewNew;
  },
  
  
  showUser: function(id) {
    var viewShow = new Views.Users.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  editUser: function() {
    
  },
  
  
  userArticles: function() {
    
  }
});
