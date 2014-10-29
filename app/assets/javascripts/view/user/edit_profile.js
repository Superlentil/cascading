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
          var oldEmail = fetchedUser.get("email");

          that.$el.html(that.template({
            nickname: fetchedUser.get("nickname"),
            email: oldEmail,
            avatarUrl: fetchedUser.get("avatar_url")
          }));
      
          that.email = $("#user-edit-email");
          that.emailValue = "";
          that.oldEmail = oldEmail;
          that.emailError = $("#user-edit-email-error");
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
    
    "blur #user-edit-email": "validateEmail",
    "blur #user-edit-nickname": "validateNickname",
    "blur #user-edit-avatar": "validateAvatar",
    "change #user-edit-verify-password": "onVerifyPasswordChange"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var email = this.email.val();
    var nickname = this.nickname.val();
    if (validator.Email(email) && validator.Nickname(nickname)) {
      var that = this;
      
      that.saveError.hide(500);
  
      var formData = new FormData();
      var userId = that.userId;
      formData.append("user[id]", userId);
      formData.append("user[email]", email);
      formData.append("user[nickname]", nickname);
      formData.append("user[verify_password]", that.verifyPassword.val());
      if ($("#user-edit-avatar").val() !== "") {
        formData.append("user[avatar]", $("#user-edit-avatar").get(0).files[0]);
      }
      
      var user = new Model.User();
      
      user.save(formData, {    
        success: function(response) {
          if (response.fail) {
            that.saveError.show(500);
            if (response.fail === "password is not correct") {
              that.verifyPasswordError.show(500);
              that.verifyPassword.addClass("input-invalid");
            }
          } else {
            that.signInHandler(null, null, true);
            Backbone.history.navigate("user/" + userId, {trigger: true});
          }
        },
        
        error: function() {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      }, "PUT", "/" + user.urlRoot + "/" + userId);
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("user/" + this.userId, {trigger: true});
  },
  
  
  onVerifyPasswordChange: function(event) {
    this.verifyPasswordError.hide(500);
    this.verifyPassword.removeClass("input-invalid");
    this.refreshSaveError();
  }
});
