// define the model "Article"
Model.Article.Article = Backbone.Model.extend({
  defaults: {
    "title": "",
    "author": "",
    "category_name": "",
    "content": "{}",
    "published": false
  },
  
  urlRoot: "articles"
});
