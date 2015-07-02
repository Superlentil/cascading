// define the model "Article"
Model.Article = Backbone.Model.extend({
  defaults: {
    "title": "",
    "author": "",
    "category_name": "",
    "content": "{}"
  },
  
  urlRoot: GlobalUtilities.PathToUrl("/articles")
});
