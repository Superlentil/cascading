Model.User = Backbone.Model.extend({
  urlRoot: GlobalUtilities.PathToUrl("/users"),
  
  
  save: ModelHelper.multipartFormSubmit
});
