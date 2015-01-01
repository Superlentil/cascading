Model.UserPublicInfo = Backbone.Model.extend({
  initialize: function(options) {
    this.userId = options.userId;
  },
  
  
  url: function() {
    return "/users/" + this.userId + "/publicInfo";
  }
});
