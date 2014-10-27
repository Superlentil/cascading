View.User.EditProfile = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/edit_profile"],
  
  
  render: function(options) {
    var userId = parseInt(options.userId);
    if (userId === parseInt($.cookie("user_id"))) {
      this.userId = userId;
      this.resetIndicators(true);
      var oldEmail = $.cookie("user_email");
  
      this.$el.html(this.template({
        nickname: $.cookie("user_nickname"),
        email: oldEmail,
        avatarUrl: $.cookie("user_avatar_url")
      }));
  
      this.email = $("#user-edit-email");
      this.emailValue = "";
      this.oldEmail = oldEmail;
      this.emailError = $("#user-edit-email-error");
      this.verifyPassword = $("#user-edit-verify-password");
      this.verifyPasswordError = $("#user-edit-verify-password-error");
      this.nickname = $("#user-edit-nickname");
      this.nicknameError = $("#user-edit-nickname-error");
      this.avatar = $("#user-edit-avatar");
      this.saveError = $("#user-edit-save-error");
    } else {
      Backbone.history.loadUrl("forbidden");
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
