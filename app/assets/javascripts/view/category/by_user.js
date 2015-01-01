View.Category.ByUser = Backbone.View.extend({
  initialize: function(options) {
    this.userId = parseInt(options.userId);
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/category/index"],
  
  
  render: function() {
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
    var that = this;
    
    var userId = user.get("id");
    var viewUserHeader = new View.User.Header({user: user});
    that.$el.append(viewUserHeader.render().$el);
    
    var allCategoriesByUser = new Collection.Category.ByUser({userId: userId});
    allCategoriesByUser.fetch({
      success: function(fetchedCategories) {
        that.$el.append(that.template({allCategories: allCategoriesByUser.models, userId: userId}));
      }
    });
  }
});
