Collection.Category.ByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Category,
  
  
  url: function() {
    return GlobalConstant.DOMAIN + "/categories/byUser.json/?" + $.param({user_id: this.userId});
  }
});
