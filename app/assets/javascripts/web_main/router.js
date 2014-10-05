Router = Backbone.Router.extend({
  routes: {
    "forbidden": "forbiddenAccess",
    
    "": "articles",
    "articles/new": "newArticle",
    "article/:id": "showArticle",
    "article/:id/edit": "editArticle",
    
    "users": "users",
    "users/new": "newUser",
    "user/:id": "showUser",
    "user/:id/edit": "editUser",
    "user/:id/articles": "userArticles",
    
    "*others": "invalidUrl"
  },
  
  
  execute: function(callback, args) {
    var that = this;
    
    $(function() {
      if (that.layout) {
        that.layout.refresh();
      } else {
        that.layout = new View.Layout.Main();
        $("body").html(that.layout.render().$el);
      }
      
      if (callback) {
        that.layout.viewContent = callback.apply(that, args);
      }
    });
  },
  
  
  forbiddenAccess: function() {
    var viewForbidden = new View.Layout.Forbidden();
    viewForbidden.render();
    return viewForbidden;
  },

  
  articles: function() {
    var viewIndex = new View.Article.Index();
    viewIndex.render();
    return viewIndex;
  },
  
  
  newArticle: function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 100) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new View.Article.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
      return viewEdit;
    } else {
      // TODO: need a better action for too frequent "new" page load.
      this.loadUrl("");
    }
  },
  
   
  showArticle: function(id) {
    var viewShow = new View.Article.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  editArticle: function(id) {
    var viewEdit = new View.Article.Edit();
    viewEdit.editArticle(id);
    return viewEdit;
  },
  
  
  users: function() {

  },
  
  
  newUser: function() {
    var viewNew = new View.User.New();
    viewNew.render();
    return viewNew;
  },
  
  
  showUser: function(id) {
    var viewShow = new View.User.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  editUser: function(id) {
    var viewEdit = new View.User.Edit();
    viewEdit.render({id: id});
    return viewEdit;
  },
  
  
  userArticles: function() {
    
  },
  
  
  invalidUrl: function() {
    this.loadUrl("");   // jump to the main page for invalid URLs
  }
});
