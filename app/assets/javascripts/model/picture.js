// define the model "Picture"
Model.Picture = Backbone.Model.extend({
  urlRoot: "pictures",
  
  
  save: ModelHelper.multipartFormSubmit
});
