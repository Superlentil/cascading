// define the view ByUser
View.Article.ByUser = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "fetchFunction");
    
    this.userId = options.userId;
    this.sortBy = options.sortBy;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/by_user"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    var that = this;
    
    var userId = that.userId;
    var globalUserCache = GlobalVariable.UserCache;
    if (globalUserCache && globalUserCache[userId]) {
      that.renderHelper(globalUserCache[userId]);
    } else {
      var user = new Model.UserPublicInfo({userId: userId});
      user.fetch({
        success: function(fetchedUser, response) {
          globalUserCache[userId] = fetchedUser;
          that.renderHelper(fetchedUser);
        }
      });
    }

    return that;
  },
  
  
  renderHelper: function(user) {
    var nickname = user.get("nickname");
    var headerSubTitle = "<a href='#/articles/user/" + user.get("id") + "' title = '" + nickname + "'>" + nickname + "</a>";
    GlobalVariable.Layout.Header.UpdateSubTitle(headerSubTitle);
    
    var viewUserHeader = new View.User.Header({user: user});
    $("#article-by-user-header").append(viewUserHeader.render().$el);
    
    this.viewArticleCascade = new View.Article.CoverCascade({fetchFunction: this.fetchFunction});
    this.viewArticleCascade.render();
  },
  
  
  fetchFunction: function(fetchSequenceNumber, articlesPerFetch, fetchOptions, callbacks) {
    var articles = new Collection.Article.ByUser({
      userId: this.userId,
      fetchSequenceNumber: fetchSequenceNumber,
      articlesPerFetch: articlesPerFetch,
      pageLoadTime: fetchOptions.pageLoadTime,
      sortBy: this.sortBy
    });
    articles.fetch(callbacks);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
