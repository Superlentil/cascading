// define the articles "Router"
Articles.Router = Backbone.Router.extend({
  routes: {
    '': 'index',
    'articles': 'index',
    'articles/new': 'new',
    'article/:id': 'show'
  },

  
  index: function() {
    var viewIndex = new Articles.Views.Index();
    viewIndex.render();
  },

  
  'new': function() {
    var now = $.now();
    var lastNewArticleTime = parseInt($.cookie("last_new_article_timestamp")) || 0;
    if (now - lastNewArticleTime > 30000) {   // Prevent loading the "new" page too frequently.
      var viewEdit = new Articles.Views.Edit();
      viewEdit.newArticle();
      $.cookie('last_new_article_timestamp', now, {expires: 1});
    } else {
      this.navigate('', {trigger: true});
    }
  },
  
  
  show: function(id) {
    var viewShow = new Articles.Views.Show();
    viewShow.render({id: id});
  }
});

