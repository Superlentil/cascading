Views.Users.Edit = Backbone.View.extend({
  el: "div#main_container",
  
  
  template: JST["templates/users/edit"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Models.Users.User({id: options.id});
      user.fetch({
        success: function(fetchedUser, response) {
          if (response.id) {
            that.model = fetchedUser;
            that.$el.html(that.template({user: fetchedUser}));
          } else {
            Backbone.history.loadUrl("forbidden");
          }
        }
      });
    }
  },
  
  
  events: {
    "click #edit_user_save_button": "onSave",
    "click #edit_user_cancel_button": "onCancel"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var that = this;
    
    var formData = new FormData();
    var userId = that.model.get("id");
    formData.append("user[id]", userId);
    formData.append("user[email]", $("#edit_user_email_input").val());
    formData.append("user[nickname]", $("#edit_user_nickname_input").val());
    if ($("#edit_user_avatar_input").val() !== "") {
      formData.append("user[avatar]", $("#edit_user_avatar_input").get(0).files[0]);
    }
    
    var user = new Models.Users.User();
    
    user.save(formData, {    
      success: function(savedUser) {
        Backbone.history.navigate("user/" + savedUser.id, {trigger: true});
      },
      
      error: function(jqXHR, textStatus, errorThrown) {},
      
      complete: function(jqXHR, textStatus ) {}
    }, "PUT", "/" + that.model.urlRoot + "/" + userId);
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("", {trigger: true});
  }
});
