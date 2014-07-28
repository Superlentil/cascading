Views.Users.Show = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["templates/users/show"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Models.Users.User({id: options.id});
      user.fetch({
        success: function(fetchedUser) {
          that.$el.html(that.template({user: fetchedUser}));
        }
      });
    }
       
    return that;
  }
});
