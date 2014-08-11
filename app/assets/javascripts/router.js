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
      
      var layoutCanvas = $("<div id='layout-canvas'></div>");
      htmlBody.append(layoutCanvas);
      htmlBody.append([
        "<div id='layout-leftNav' style='z-index: " + GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX + "'></div>",
        "<div id='layout-rightNav' style='z-index: " + GlobalConstant.Layout.HIDDEN_NAV_Z_INDEX + "'></div>"
      ].join(""));
      
      var mainHeader = $("<nav id='layout-header' class='navbar navbar-default navbar-fixed-top' role='navigation'></nav>");
      layoutCanvas.append(mainHeader);
      that.layoutHeader = new View.Layout.Header();
      that.layoutHeader.render();
      
      var paddingTopSize = mainHeader.height() + 10;
      layoutCanvas.css("padding-top", paddingTopSize + "px");
      
      layoutCanvas.append([
        "<div id='layout-message' class='container' style='display:none;'></div>",
        "<div id='layout-content' class='container'></div>"
      ].join(""));
      
      that.layoutLeftNav = new View.Layout.LeftNav();
      that.layoutLeftNav.render();
      
      that.layoutRightNav = new View.Layout.RightNav();
      that.layoutRightNav.render();
      
      that.layoutMessage = new View.Layout.Message();
      that.layoutMessage.render();
      
      if (callback) {
        that.lastView = callback.apply(that, args);
      }
    });
  },
  
  
  forbiddenAccess: function() {
    var viewForbidden = new View.Layout.Forbidden();
    viewForbidden.render();
    return viewForbidden;
  },

  
  articles: function() {
    var viewIndex = new View.Article.Index.Main();
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
      // @TODO: need a better action for too frequent "new" page load.
      this.loadUrl('');
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
    
  }
});
