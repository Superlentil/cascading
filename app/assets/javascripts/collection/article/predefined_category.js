Collection.Article.PredefinedCategory = Backbone.Collection.extend({
  model: Model.Article.Category,
  
  
  url: "/categories/predefined"
});
