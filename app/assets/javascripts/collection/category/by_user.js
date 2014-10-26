Collection.Category.ByUser = Backbone.Collection.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  model: Model.Category,
  
  
  url: function() {
    return "/categories/byUser/?" + $.param({user_id: this.userId});
  }
});
