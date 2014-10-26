Router = Backbone.Router.extend({
  routes: {
    "forbidden": "forbiddenAccess",
    
    "": "allArticles",
    "articles/category/:category_id": "articlesInCategory",
    "articles/user/:user_id": "articlesByUser",
    "articles/user/:user_id/category/:category_id": "articlesByUserAndCategory",
    "articles/new": "newArticle",
    "article/:id": "showArticle",
    "article/:id/edit": "editArticle",
    
    "categories": "allCategories",
    "categories/user/:user_id": "categoriesByUser",
    
    "users": "allUsers",
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

  
  allArticles: function() {
    var viewIndex = new View.Article.Index();
    viewIndex.render();
    return viewIndex;
  },
  
  
  articlesInCategory: function(categoryId) {
    var viewArticlesInCategory = new View.Article.InCategory({categoryId: categoryId});
    viewArticlesInCategory.render();
    return viewArticlesInCategory;
  },
  
  
  articlesByUser: function(userId) {
    var viewArticlesByUser = new View.Article.ByUser({userId: userId});
    viewArticlesByUser.render();
    return viewArticlesByUser;
  },
  
  
  articlesByUserAndCategory: function(userId, categoryId) {
    var viewArticlesByUserAndCategory = new View.Article.ByUserAndCategory({userId: userId, categoryId: categoryId});
    viewArticlesByUserAndCategory.render();
    return viewArticlesByUserAndCategory;
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
  
  
  allCategories: function() {
    var viewCategories = new View.Category.Index();
    viewCategories.render();
    return viewCategories;
  },
  
  
  categoriesByUser: function(userId) {
    var viewCategoriesByUser = new View.Category.ByUser({userId: userId});
    viewCategoriesByUser.render();
    return viewCategoriesByUser;
  },
  
  
  allUsers: function() {

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
