View.User.New = View.User.ModifyInputValidator.extend({
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.resetIndicators(false);
    
    this.viewCaptcha = new View.Captcha({validateCallback: this.markCaptchaStatus});
    $("#user-new-captcha").append(this.viewCaptcha.render().$el);
    
    this.email = $("#user-new-email");
    this.emailValue = "";
    this.emailError = $("#user-new-email-error");
    this.password = $("#user-new-password");
    this.passwordError = $("#user-new-password-error");
    this.repeatPassword = $("#user-new-repeat-password");
    this.repeatPasswordError = $("#user-new-repeat-password-error");
    this.nickname = $("#user-new-nickname");
    this.nicknameError = $("#user-new-nickname-error");
    this.avatar = $("#user-new-avatar");
    this.captcha = $("#user-new-captcha");
    this.captchaError = $("#user-new-captcha-error");
    this.saveError = $("#user-new-save-error");
    
    return this;
  },
  
  
  events: {
    "click #user-new-save": "onSave",
    "click #user-new-cancel": "onCancel",
    
    "blur #user-new-email": "validateEmail",
    "blur #user-new-password": "validatePassword",
    "blur #user-new-repeat-password": "validateRepeatPassword",
    "blur #user-new-nickname": "validateNickname",
    "blur #user-new-avatar": "validateAvatar"
  },

  
  onSave: function(event) {
    event.preventDefault();
    
    var validator = GlobalValidator;
    var email = this.email.val();
    var password = this.password.val();
    var nickname = this.nickname.val();
    if (validator.Email(email) 
        && validator.Password(password) 
        && password === this.repeatPassword.val() 
        && validator.Nickname(nickname)
        && this.viewCaptcha.hasPassedCaptcha())
    {
      var that = this;
      
      that.saveError.hide(500);
      
      var formData = new FormData();
      formData.append("user[email]", email);
      formData.append("user[password]", password);
      formData.append("user[nickname]", nickname);
      var avatarInput = $("#user-new-avatar");
      if (avatarInput.val()) {
        formData.append("user[avatar]", avatarInput.get(0).files[0]);
      }
      formData.append("user[tier]", GlobalConstant.User.Tier.UNVERIFIED);
      
      var user = new Model.User();
      
      user.save(formData, {
        success: function(savedUser) {
          that.signInHandler(null, null, true);
          Backbone.history.navigate("#/user/" + savedUser.id, {trigger: true});
        },
        
        error: function(unsavedUser, response) {
          that.saveError.show(500);
          that.validateEmail(null, true);
        }
      });
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#", {trigger: true});
  }
});
