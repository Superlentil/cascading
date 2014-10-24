View.User.Edit = View.User.ModifyUserInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit"],
  
  
  render: function(options) {
    var that = this;
    
    if (options.id) {
      var user = new Model.User.User({id: options.id});
      user.fetch({
        success: function(fetchedUser, response) {
          if (response.id) {
            that.model = fetchedUser;
            that.$el.html(that.template({user: fetchedUser}));
            
            that.captchaValid = true;
            that.email = $("#user-edit-email");
            that.emailValue = "";
            that.oldEmail = fetchedUser.get("email");
            that.emailError = $("#user-edit-email-error");
            that.password = $("#user-edit-verify-password");
            that.nickname = $("#user-edit-nickname");
            that.nicknameError = $("#user-edit-nickname-error");
            that.avatar = $("#user-edit-avatar");
            that.saveError = $("#user-edit-save-error");
          } else {
            Backbone.history.loadUrl("forbidden");
          }
        }
      });
    }
  },
  
  
  events: {
    "click #user-edit-save": "onSave",
    "click #user-edit-cancel": "onCancel",
    
    "blur #user-edit-email": "validateEmail",
    "blur #user-edit-nickname": "validateNickname",
    "blur #user-edit-avatar": "validateAvatar"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var email = this.email.val();
    var password = this.password.val();
    var nickname = this.nickname.val();
    if (validator.Email(email) 
        && validator.Password(password) 
        && validator.Nickname(nickname))
    {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      var userId = that.model.get("id");
      formData.append("user[id]", userId);
      formData.append("user[email]", email);
      formData.append("user[nickname]", nickname);
      formData.append("user[password]", password);
      if ($("#user-edit-avatar").val() !== "") {
        formData.append("user[avatar]", $("#user-edit-avatar").get(0).files[0]);
      }
      
      var user = new Model.User.User();
      
      user.save(formData, {    
        success: function(savedUser) {
          that.signInHandler(null, null, true);
          Backbone.history.navigate("user/" + savedUser.id, {trigger: true});
        },
        
        error: function(unsavedUser, response) {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      }, "PUT", "/" + that.model.urlRoot + "/" + userId);
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("user/" + this.model.get("id"), {trigger: true});
  }
});
