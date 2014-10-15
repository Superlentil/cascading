View.User.New = Backbone.View.extend({
  initialize: function(options) {   
    this.signInHandler = options.signInHandler;
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/new"],
  
  
  render: function() {
    this.$el.html(this.template());
  },
  
  
  events: {
    "click #user-new-save": "onSave",
    "click #user-new-cancel": "onCancel",
    
    "blur #user-new-email": "validateEmail",
    "blur #user-new-password": "validatePassword",
    "blur #user-new-repeat-password": "validateRepeatPassword",
    "blur #user-new-nickname": "validateNickname"
  },
  
  
  onSave: function(event) {
    event.preventDefault();
    
    if (this.validateEmail() && this.validateRepeatPassword() && this.validateNickname()) {
      var that = this;
      
      var formData = new FormData();
      formData.append("user[email]", $("#user-new-email").val());
      formData.append("user[password]", $("#user-new-password").val());
      formData.append("user[nickname]", $("#user-new-nickname").val());
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
        
        error: function(jqXHR, textStatus, errorThrown) {},
        
        complete: function(jqXHR, textStatus ) {}
      });
    } else {
      alert("invalid inputs");
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
  
  
  validate: function(input, validator) {
    var value = input.val();
    if (validator(value)) {
      this.markValid(input);
      return true;
    } else {
      value ? this.markInvalid(input) : this.removeMark(input);
      return false;
    }
  },
  
  
  validateEmail: function(event) {
    var input = $("#user-new-email");
    return this.validate(input, GlobalValidator.Email);
  },
  
  
  validatePassword: function(event) {
    var input = $("#user-new-password");
    var validPassword = this.validate(input, GlobalValidator.Password);
    this.validateRepeatPassword();
    return validPassword;
  },


  validateRepeatPassword: function(event) {
    var repeatPasswordInput = $("#user-new-repeat-password");
    if (repeatPasswordInput.val()) {
      var passwordInput = $("#user-new-password");
      var password = passwordInput.val();
      if (GlobalValidator.Password(password)) {
        if (repeatPasswordInput.val() === password) {
          this.markValid(repeatPasswordInput);
          return true;
        } else {
          this.markInvalid(repeatPasswordInput);
          return false;
        }
      } else {
        this.markInvalid(repeatPasswordInput);
        return false;
      }
    } else {
      this.removeMark(repeatPasswordInput);
      return false;
    }
  },


  validateNickname: function(event) {
    var input = $("#user-new-nickname");
    return this.validate(input, GlobalValidator.Nickname);
  }
});
