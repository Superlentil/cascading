// define the view ByUser
View.Article.ByUser = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "articleFetchFunction");
    
    this.userId = options.userId;
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
    var viewUserHeader = new View.User.Header({user: user});
    $("#article-by-user-header").append(viewUserHeader.render().$el);
    
    this.viewArticleCascade = new View.Article.Cascade.Cover({fetchFunction: this.fetchFunction});
    this.viewArticleCascade.render();
  },
  
  
  fetchFunction: function(batchToLoad, articlesPerBatch, options) {
    var articles = new Collection.Article.ByUser({
      userId: this.userId,
      batch: batchToLoad,
      articlesPerBatch: articlesPerBatch
    });
    articles.fetch(options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
