View.User.EditProfile = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit_profile"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt($.cookie("user_id"))) {
      var that = this;
      
      var user = new Model.User({id: userId});
      user.fetch({
        success: function(fetchedUser) {
          that.userId = fetchedUser.get("id");
          that.resetIndicators(true);

          that.$el.html(that.template({
            nickname: fetchedUser.get("nickname"),
            avatarUrl: fetchedUser.get("avatar_url")
          }));
      
          that.verifyPassword = $("#user-edit-verify-password");
          that.verifyPasswordError = $("#user-edit-verify-password-error");
          that.nickname = $("#user-edit-nickname");
          that.nicknameError = $("#user-edit-nickname-error");
          that.avatar = $("#user-edit-avatar");
          that.saveError = $("#user-edit-save-error");
          
          return that;
        }
      });
    } else {
      Backbone.history.loadUrl("forbidden");
      return this;
    }
  },
  
  
  events: {
    "click #user-edit-save": "onSave",
    "click #user-edit-cancel": "onCancel",
    
    "blur #user-edit-nickname": "validateNickname",
    "blur #user-edit-avatar": "validateAvatar",
    "blur #user-edit-verify-password": "validateVerifyPassword"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var verifyPassword = this.verifyPassword.val();
    var nickname = this.nickname.val();

    if (validator.Password(verifyPassword) && validator.Nickname(nickname)) {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      var userId = that.userId;
      formData.append("user[id]", userId);
      formData.append("user[nickname]", nickname);
      formData.append("user[verify_password]", verifyPassword);
      if ($("#user-edit-avatar").val() !== "") {
        formData.append("user[avatar]", $("#user-edit-avatar").get(0).files[0]);
      }
      
      var user = new Model.User();
      
      user.save(formData, {    
        success: function(response) {
          if (response.fail) {
            that.saveError.show(500);
            if (response.fail === "password is not correct") {
              that.markInvalid(that.verifyPassword);
              that.verifyPasswordError.show(500);
            }
          } else {
            that.signInHandler(null, null, true);
            Backbone.history.navigate("#/user/" + userId, {trigger: true});
          }
        },
        
        error: function() {
          that.saveError.show(500);
        }
      }, "PUT", "/" + user.urlRoot + "/" + userId);
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#/user/" + this.userId, {trigger: true});
  }
});
