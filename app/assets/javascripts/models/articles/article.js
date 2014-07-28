// define the model "Article"
Models.Articles.Article = Backbone.Model.extend({
  defaults: {
    "title": "",
    "author": "",
    "category": "",
    "content": "{}",
    "published": false
  },
  
  urlRoot: "articles"
});
