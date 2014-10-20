View.User.New = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
    
    _.bindAll(this, "validateCaptcha");
    
    this.emailValid = false;
    this.repeatPasswordValid = false;
    this.nicknameValid = false;
    this.captchaValid = false;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
    
    this.viewCaptcha = new View.Captcha({validateCallback: this.validateCaptcha});
    $("#user-new-captcha").append(this.viewCaptcha.render().$el);
    
    this.email = $("#user-new-email");
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
  
  
  delegateEvents: function() {
    Backbone.View.prototype.delegateEvents.call(this);
    if (this.viewCaptcha) {
      this.viewCaptcha.delegateEvents();
    }
  },
  
  
  undelegateEvents: function() {
    Backbone.View.prototype.undelegateEvents.call(this);
    if (this.viewCaptcha) {
      this.viewCaptcha.undelegateEvents();
    }
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
      
      this.saveError.hide(500);
      
      var formData = new FormData();
      formData.append("user[email]", email);
      formData.append("user[password]", password);
      formData.append("user[nickname]", nickname);
      var avatarInput = $("#user-new-avatar");
      if (avatarInput.val()) {
        formData.append("user[avatar]", avatarInput.get(0).files[0]);
      }
      formData.append("user[tier]", GlobalConstant.UserTier.FREE_USER);
      
      var user = new Model.User.User();
      
      user.save(formData, {
        success: function(savedUser) {
          that.signInHandler(null, null, true);
          Backbone.history.navigate("user/" + savedUser.id, {trigger: true});
        },
        
        error: function(unsavedUser, response) {
          that.saveError.show(500);
          that.validateEmail();
        }
      });
    } else {
      this.saveError.show(500);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("", {trigger: true});
  },
  
  
  markInvalid: function(input) {
    input.removeClass("input-valid");
    input.addClass("input-invalid");
  },
  
  
  markValid: function(input) {
    input.removeClass("input-invalid");
    input.addClass("input-valid");
  },
  
  
  removeMark: function(input) {
    input.removeClass("input-valid input-invalid");
  },
  
  
  validate: function(input, errorInfoContainer, validator) {
    var value = input.val();
    if (validator(value)) {
      this.markValid(input);
      errorInfoContainer.hide(500);
      return true;
    } else {
      if (value) {
        this.markInvalid(input);
        errorInfoContainer.show(500);
      } else {
        this.removeMark(input);
        errorInfoContainer.hide(500);
      }
      return false;
    }
  },
  
  
  refreshSaveError: function() {
    if (this.emailValid && this.repeatPasswordValid && this.nicknameValid && this.captchaValid) {
      this.saveError.hide(500);
    }
  },
  
  
  validateEmail: function(event) {
    var input = this.email;
    var inputError = this.emailError;
    var email = input.val();
    var isValid = false;
    
    if (email) {
      if (GlobalValidator.Email(email)) {
        var that = this;

        this.removeMark(input);
        inputError.html("<small style='color: blue'>Check the availablity for this email ...</small>");
        inputError.show(500);
        
        $.ajax({
          url: "/users/emailAvailable",
          dataType: "json",
          data: {email: input.val()},
          success: function(returnedData) {
            if (returnedData.available) {
              that.markValid(input);
              inputError.hide(500);
              that.emailValid = true;
              that.refreshSaveError();
            } else {
              that.markInvalid(input);
              inputError.html("<small>This email has been registered.</small>");
              this.emailValid = false;
            }
          }
        });
      } else {
        this.markInvalid(input);
        inputError.html("<small>The format of the input email is not correct.</small>");
        inputError.show(500);
        this.emailValid = false;
      }
    } else {
      this.removeMark(input);
      inputError.hide(500);
      this.emailValid = false;
    }
  },
  
  
  validatePassword: function(event) {
    this.validate(this.password, this.passwordError, GlobalValidator.Password);
    this.validateRepeatPassword();
    this.refreshSaveError();
  },


  validateRepeatPassword: function(event) {
    var input = this.repeatPassword;
    var errorInfoContainer = this.repeatPasswordError;
    if (input.val()) {
      var isValid = false;
      var password = this.password.val();
      if (GlobalValidator.Password(password) && input.val() === password) {
        isValid = true;
      }
      
      if (isValid) {
        this.markValid(input);
        errorInfoContainer.hide(500);
      } else {
        this.markInvalid(input);
        errorInfoContainer.show(500);
      }
    } else {
      this.removeMark(input);
      errorInfoContainer.hide(500);
    }
    
    this.repeatPasswordValid = isValid;
    this.refreshSaveError();
  },


  validateNickname: function(event) {
    this.nicknameValid = this.validate(this.nickname, this.nicknameError, GlobalValidator.Nickname);
    this.refreshSaveError();
  },
  
  
  validateAvatar: function(event) {
    if (this.avatar.val()) {
      this.markValid(this.avatar);
    } else {
      this.removeMark(this.avatar);
    }
  },
  
  
  validateCaptcha: function(passCaptchaValidate) {
    var captchaContainer = this.captcha;
    var captchaErrorInfoContainer = this.captchaError;
    this.captchaValid = passCaptchaValidate;
    if (passCaptchaValidate) {
      this.markValid(captchaContainer);
      captchaErrorInfoContainer.hide(500);
      this.refreshSaveError();
    } else {
      this.markInvalid(captchaContainer);
      captchaErrorInfoContainer.show(500);
    }
  },
  
  
  remove: function() {
    this.viewCaptcha.remove();
    
    Backbone.View.prototype.remove.call(this);
  }
});
