Router = Backbone.Router.extend({
  routes: {
    "forbidden": "forbiddenAccess",
    
    "": "articlesAll",
    "articles/sort_by/:sort_by_type": "articlesAllSorted",
    
    "articles/category/:category_id": "articlesInCategory",
    "articles/category/:category_id/sort_by/:sort_by_type": "articlesInCategorySorted",
    "articles/user/:user_id": "articlesByUser",
    "articles/user/:user_id/sort_by/:sort_by_type": "articlesByUserSorted",
    "articles/user/:user_id/category/:category_id": "articlesByUserAndCategory",
    "articles/user/:user_id/category/:category_id/sort_by/:sort_by_type": "articlesByUserAndCategorySorted",
    "articles/search/:keyword": "articlesSearch",
    "articles/draft/user/:user_id": "articlesDraftByUser",
    
    "articles/new": "articleNew",
    "article/:id": "articleShow",
    "article/:id/gallery": "articleShowInGalleryMode",
    "article/:id/edit": "articleEdit",
    
    "categories": "categoriesAll",
    "categories/user/:user_id": "categoriesByUser",
    
    "users": "usersAll",
    "users/new": "userNew",
    "users/retrieve/password": "userRetrievePassword",
    "user/:id": "userShow",
    "user/:id/edit/profile": "userEditProfile",
    "user/:id/edit/email": "userEditEmail",
    "user/:id/edit/password": "userEditPassword"
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
        GlobalVariable.Browser.Window.scrollTop(0);
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
    return this.articlesAllSorted(GlobalConstant.Article.SortBy.PUBLISH_TIME_DESC);
  },
  
  
  articlesAllSorted: function(sortByType) {
    var viewIndex = new View.Article.Index({sortBy: sortByType});
    viewIndex.render();
    return viewIndex;
  },
  
  
  articlesDraftByUser: function(userId) {
    var viewDraftArticlesByUser = new View.Article.DraftByUser({userId: userId});
    viewDraftArticlesByUser.render();
    return viewDraftArticlesByUser;
  },
  
  
  articlesInCategory: function(categoryId) {
    return this.articlesInCategorySorted(categoryId, GlobalConstant.Article.SortBy.PUBLISH_TIME_DESC);
  },
  
  
  articlesInCategorySorted: function(categoryId, sortByType) {
    var viewArticlesInCategory = new View.Article.InCategory({categoryId: categoryId, sortBy: sortByType});
    viewArticlesInCategory.render();
    return viewArticlesInCategory;
  },
  
  
  articlesByUser: function(userId) {
    return this.articlesByUserSorted(userId, GlobalConstant.Article.SortBy.PUBLISH_TIME_DESC);
  },
  
  
  articlesByUserSorted: function(userId, sortByType) {
    var viewArticlesByUser = new View.Article.ByUser({userId: userId, sortBy: sortByType});
    viewArticlesByUser.render();
    return viewArticlesByUser;
  },
  
  
  articlesByUserAndCategory: function(userId, categoryId) {
    return this.articlesByUserAndCategorySorted(userId, categoryId, GlobalConstant.Article.SortBy.PUBLISH_TIME_DESC);
  },
  
  
  articlesByUserAndCategorySorted: function(userId, categoryId, sortByType) {
    var viewArticlesByUserAndCategory = new View.Article.ByUserAndCategory({userId: userId, categoryId: categoryId, sortBy: sortByType});
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
    var viewShow = new View.Article.Show.Main({id: id});
    viewShow.render();
    return viewShow;
  },
  
  
  articleShowInGalleryMode: function(id, paragraph) {
    var viewShow = new View.Article.Show.Main({id: id, initialInGalleryMode: true});
    viewShow.render();
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
  
  
  userRetrievePassword: function(id) {
    var viewRetrievePassword = new View.User.RetrievePassword();
    viewRetrievePassword.render();
    return viewRetrievePassword;
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
    var viewEditEmail = new View.User.EditEmail();
    viewEditEmail.render({userId: id});
    return viewEditEmail;
  },
  
  
  userEditPassword: function(id) {
    var viewEditPassword = new View.User.EditPassword();
    viewEditPassword.render({userId: id});
    return viewEditPassword;
  }
});
