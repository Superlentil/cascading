Router = Backbone.Router.extend({
  routes: {
    "forbidden": "forbiddenAccess",
    
    "": "articlesAll",
    
    "articles/draft/user/:user_id": "articlesDraftByUser",
    "articles/category/:category_id": "articlesInCategory",
    "articles/user/:user_id": "articlesByUser",
    "articles/user/:user_id/category/:category_id": "articlesByUserAndCategory",
    "articles/search/:keyword": "articlesSearch",
    
    "articles/new": "articleNew",
    "article/:id": "articleShow",
    "article/:id/edit": "articleEdit",
    
    "categories": "categoriesAll",
    "categories/user/:user_id": "categoriesByUser",
    
    "users": "usersAll",
    "users/new": "userNew",
    "user/:id": "userShow",
    "user/:id/edit/profile": "userEditProfile",
    "user/:id/edit/email": "userEditEmail",
    "user/:id/edit/password": "userEditPassword",
    "user/:id/retrieve/password": "userRetrievePassword"
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

  
  articlesAll: function() {
    var viewIndex = new View.Article.Index();
    viewIndex.render();
    return viewIndex;
  },
  
  
  articlesDraftByUser: function(userId) {
    var viewDraftArticlesByUser = new View.Article.DraftByUser({userId: userId});
    viewDraftArticlesByUser.render();
    return viewDraftArticlesByUser;
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
  
  
  articlesSearch: function(keyword) {
    var viewArticlesSearch = new View.Article.Search({keyword: keyword});
    viewArticlesSearch.render();
    return viewArticlesSearch;
  },
  
  
  articleNew: function() {
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
  
   
  articleShow: function(id) {
    var viewShow = new View.Article.Show.Main();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  articleEdit: function(id) {
    var viewEdit = new View.Article.Edit();
    viewEdit.editArticle(id);
    return viewEdit;
  },
  
  
  categoriesAll: function() {
    var viewCategories = new View.Category.Index();
    viewCategories.render();
    return viewCategories;
  },
  
  
  categoriesByUser: function(userId) {
    var viewCategoriesByUser = new View.Category.ByUser({userId: userId});
    viewCategoriesByUser.render();
    return viewCategoriesByUser;
  },
  
  
  usersAll: function() {
  },
  
  
  userNew: function() {
    var viewNew = new View.User.New({signInHandler: this.layout.signIn});
    viewNew.render();
    return viewNew;
  },
  
  
  userShow: function(id) {
    var viewShow = new View.User.Show();
    viewShow.render({id: id});
    return viewShow;
  },
  
  
  userEditProfile: function(id) {
    var viewEditProfile = new View.User.EditProfile({signInHandler: this.layout.signIn});
    viewEditProfile.render({userId: id});
    return viewEditProfile;
  },
  
  
  userEditEmail: function(id) {
    var viewEditEmail = new View.User.EditEmail({signInHandler: this.layout.signIn});
    viewEditEmail.render({userId: id});
    return viewEditEmail;
  },
  
  
  userEditPassword: function(id) {
    var viewEditPassword = new View.User.EditPassword({signInHandler: this.layout.signIn});
    viewEditPassword.render({userId: id});
    return viewEditPassword;
  },
  
  
  userRetrievePassword: function(id) {
    
  }
});
