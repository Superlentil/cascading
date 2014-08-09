// define the articles "Router"
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
    
    "*others": "allArticles"
  },
  
  
  execute: function(callback, args) {
    var that = this;
    
    // console.log("router -> execute");
    if (that.lastView) {
      that.lastView.remove();
    }
    if (that.layoutHeader) {
      that.layoutHeader.remove();
    }
    if (that.layoutLeftNav) {
      that.layoutLeftNav.remove();
    }
    if (that.layoutRightNav) {
      that.layoutRightNav.remove();
    }
    if (that.layoutMessage) {
      that.layoutMessage.remove();
    }
    
    $(function() {
      var htmlBody = $("body");
      htmlBody.empty();
            
      var minScreenHeightCss = "min-height: " + GlobalConstant.Screen.HEIGHT + "px";
      var minScreenWidthCss = "min-width: " + GlobalConstant.Screen.WIDTH + "px";
      
      var mainContainer = $("<div id='layouts-navBlocker' style='z-index: " + GlobalConstant.Layout.NAV_BLOCKER_Z_INDEX + "'></div>");
      htmlBody.append(mainContainer);
      htmlBody.append([
        "<div id='layouts-leftNav' style='z-index: " + GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX + "'></div>",
        "<div id='layouts-rightNav' style='z-index: " + GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX + "'></div>"
      ].join(""));
      
      var mainHeader = $("<nav id='layouts-header' class='navbar navbar-default navbar-fixed-top' role='navigation'></nav>");
      mainContainer.append(mainHeader);
      that.layoutHeader = new Views.Layouts.Header();
      that.layoutHeader.render();
      
      var paddingTopSize = mainHeader.height() + 10;
      mainContainer.css("padding-top", paddingTopSize + "px");
      
      mainContainer.append([
        "<div id='main_message' class='container' style='display:none;'></div>",
        "<div id='main_container' class='container'></div>"
      ].join(""));
      
      that.layoutLeftNav = new Views.Layouts.LeftNav();
      that.layoutLeftNav.render();
      
      that.layoutRightNav = new Views.Layouts.RightNav();
      that.layoutRightNav.render();
      
      that.layoutMessage = new Views.Layouts.Message();
      that.layoutMessage.render();
      
      if (callback) {
        that.lastView = callback.apply(that, args);
      }
    });
  },
  
  
  forbiddenAccess: function() {
    var viewForbidden = new Views.Layouts.Forbidden();
    viewForbidden.render();
    return viewForbidden;
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
  
  
  editUser: function(id) {
    var viewEdit = new Views.Users.Edit();
    viewEdit.render({id: id});
    return viewEdit;
  },
  
  
  userArticles: function() {
    
  }
});
