Collection.Category.All = Backbone.Collection.extend({
  model: Model.Category,
  
  
  url: function() {
  	return GlobalConstant.DOMAIN + "/categories.json";
  }
});
