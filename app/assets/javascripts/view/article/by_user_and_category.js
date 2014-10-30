// define the view ByUserAndCategory
View.Article.ByUserAndCategory = Backbone.View.extend({
  initialize: function(options) {
    _.bindAll(this, "articleFetchFunction");
    
    this.userId = options.userId;
    this.categoryId = options.categoryId;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/article/by_user_and_category"],
  
  
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
    $("#article-by-user-and-category-header").append(viewUserHeader.render().$el);
    
    this.viewArticleCascade = new View.Article.Cascade.Main({articleFetchFunction: this.articleFetchFunction});
    this.viewArticleCascade.render();
  },
  
  
  articleFetchFunction: function(batchToLoad, countPerBatch, options) {
    var articles = new Collection.Article.ByUserAndCategory({userId: this.userId, categoryId: this.categoryId});
    articles.fetchBatch(batchToLoad, countPerBatch, options);
  },

  
  onWidthChange: function() {
    this.viewArticleCascade.onWidthChange();
  },
  
  
  remove: function() {   
    this.viewArticleCascade.remove();

    Backbone.View.prototype.remove.call(this);
  }
});
