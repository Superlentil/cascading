Router = Backbone.Router.extend({
  routes: {
    "forbidden": "forbiddenAccess",
    
    "": "articles",
    "articles/category/:category_id": "articlesInCategory",
    "articles/user/:user_id": "articlesByUser",
    "articles/new": "newArticle",
    "article/:id": "showArticle",
    "article/:id/edit": "editArticle",
    
    "categories": "categories",
    
    "users": "users",
    "users/new": "newUser",
    "user/:id": "showUser",
    "user/:id/edit/profile": "editUserProfile",
    "user/:id/edit/password": "editUserPassword"
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
  
  
  articlesInCategory: function(categoryId) {
    var viewInCategory = new View.Article.InCategory({categoryId: categoryId});
    viewInCategory.render();
    return viewInCategory;
  },
  
  
  articlesByUser: function(userId) {
    var viewByUser = new View.Article.ByUser({userId: userId});
    viewByUser.render();
    return viewByUser;
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
  
  
  categories: function() {
    var viewCategories = new View.Category.Index();
    viewCategories.render();
    return viewCategories;
  },
  
  
  users: function() {

  },
  
  
  newUser: function() {
    var viewNew = new View.User.New({signInHandler: this.layout.signIn});
    viewNew.render();
    return viewNew;
  },
  
  
  showUser: function(id) {
    var viewShow = new View.User.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  editUserProfile: function(id) {
    var viewEditProfile = new View.User.EditProfile({signInHandler: this.layout.signIn});
    viewEditProfile.render({id: id});
    return viewEditProfile;
  },
  
  
  editUserPassword: function(id) {
    var viewEditPassword = new View.User.EditPassword({signInHandler: this.layout.signIn});
    viewEditPassword.render({id: id});
    return viewEditPassword;
  }
});
