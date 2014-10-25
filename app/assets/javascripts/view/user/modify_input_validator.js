View.User.ModifyInputValidator = Backbone.View.extend({
  initialize: function(options) {
    if(options && options.signInHandler) {
      this.signInHandler = options.signInHandler;
    }
    
    _.bindAll(this, "markCaptchaStatus");
  },
  
  
  resetIndicators: function(value) {
    this.emailValid = value;
    this.repeatPasswordValid = value;
    this.nicknameValid = value;
    this.captchaValid = value;
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
  
  
  validateEmail: function(event, forceToValidate) {
    var input = this.email;
    var inputError = this.emailError;
    var email = input.val();
    var isValid = false;
    
    if (email) {
      if (this.oldEmail && (email === this.oldEmail)) {
        this.markValid(input);
        inputError.hide(500);
        this.emailValid = true;
        this.refreshSaveError();
      } else {
        if (GlobalValidator.Email(email)) {
          if (email !== this.emailValue || forceToValidate) {
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
                  that.emailValue = email;
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
          }
        } else {
          this.markInvalid(input);
          inputError.html("<small>The format of the input email is not correct.</small>");
          inputError.show(500);
          this.emailValid = false;
        }
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
  
  
  markCaptchaStatus: function(statusCode) {
    var captchaContainer = this.captcha;
    var captchaErrorInfoContainer = this.captchaError;
    this.captchaValid = false;
    if (statusCode === 2) {
      this.captchaValid = true;
      this.markValid(captchaContainer);
      captchaErrorInfoContainer.hide(500);
      this.refreshSaveError();
    } else if (statusCode === 1) {
      this.removeMark(captchaContainer);
      captchaErrorInfoContainer.hide(500);
    } else {
      this.markInvalid(captchaContainer);
      captchaErrorInfoContainer.show(500);
    }
  },
  
  
  remove: function() {
    if (this.viewCaptcha) {
      this.viewCaptcha.remove();
    }
    
    Backbone.View.prototype.remove.call(this);
  }
});
