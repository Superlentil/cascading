Model.UserPublicInfo = Backbone.Model.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  url: function() {
    return GlobalUtilities.PathToUrl("/users/" + this.userId + "/publicInfo");
  }
});
