Collection.Category.All = Backbone.Collection.extend({
  model: Model.Category,
  
  
  url: function() {
  	return GlobalUtilities.PathToUrl("/categories");
  }
});
