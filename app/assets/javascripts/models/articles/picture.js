// define the model "Picture"
Models.Articles.Picture = Backbone.Model.extend({
  urlRoot: "pictures",
  
  
  save: ModelHelper.multipartFormSubmit
});
