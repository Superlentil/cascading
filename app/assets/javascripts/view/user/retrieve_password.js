View.User.RetrievePassword = View.User.ModifyInputValidator.extend({
  initializeHelper: function(options) {
    _.bindAll(this, "onSubmit");
    _.bindAll(this, "sendEmail");
  },
  
  
  el: "#layout-content",
  
  
  template: JST["template/user/retrieve_password"],
  
  
  render: function() {
    this.$el.html(this.template());

    this.email = $("#user-retrieve-email");
    this.emailError = $("#user-retrieve-email-error");
    this.submitInputError = $("#user-retrieve-submit-input-error");
    this.submitNoEmailError = $("#user-retrieve-submit-no-email-error");
    
    this.submit = $("#user-retrieve-submit");
    this.submit.one("click", this.onSubmit);
    
    this.resendEmailButton = $("#m-resend-email");
    this.resendEmailButton.one("click", this.sendEmail);
  },
  
  
  events: {
    "click #user-retrieve-cancel": "onCancel",
    "blur #user-retrieve-email": "validateRetrieveEmail"
  },
  
  
  onSubmit: function(event) {
    event.preventDefault();

    this.submitInputError.hide();
    this.submitNoEmailError.hide();
    
    if (GlobalValidator.Email(this.email.val())) {
      this.sendEmail();
    } else {
      this.submitInputError.show(500);
      this.submit.one("click", this.onSubmit);
    }
  },
  
  
  onCancel: function(event) {
    event.preventDefault();
    Backbone.history.navigate("#", {trigger: true});
  },
  
  
  sendEmail: function(event) {
    var that = this;

    $.ajax({
      type: "POST",
      url: "/users/retrievePassword/?" + $.param({retrieve_email: that.email.val()}),
      dataType: "json",
      beforeSend: function() {
        $("#m-resend-status").empty();
      },
      success: function(response) {
        if (response.fail) {
          if (response.fail === "retrieve email is not found") {
            that.submitNoEmailError.show(500);
          }
        } else {
          var retrieveForm = $("#user-retrieve-form");
          if (retrieveForm.is(":visible")) {
            retrieveForm.hide();
          }
          var retrieveCallback = $("#user-retrieve-callback");
          if (retrieveCallback.is(":hidden")) {
            retrieveCallback.removeClass("hide");
          } else {
            $("#m-resend-status").html(" &#160; &#160; Successfully Resended!");
          }
        }
      },
      complete: function() {
        that.submit.off("click");
        that.resendEmailButton.off("click");
        that.submit.one("click", that.onSubmit);
        that.resendEmailButton.one("click", that.sendEmail);
      }
    });
  },
  
  
  validateRetrieveEmail: function(event) {
    var emailInput = this.email;
    var emailError = this.emailError;
    var email = emailInput.val();
    if (email.length === 0 || GlobalValidator.Email(email)) {
      this.removeMark(emailInput);
      emailError.hide(500);
      this.submitInputError.hide(500);
    } else {
      this.submitNoEmailError.hide();
      this.markInvalid(emailInput);
      emailError.show(500);
    }
  },
  
  
  removeHelper: function() {
    this.submit.off("click");
    this.resendEmailButton.off("click");
  }
});
