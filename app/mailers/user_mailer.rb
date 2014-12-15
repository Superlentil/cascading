class UserMailer < ActionMailer::Base
  default from: "noreply@haigy.com"
  
  
  def welcome(user)
    @user = user
    mail(to: @user.email, subject: "Welcome to Haigy.com")
  end
  
  
  def verifySignUpEmail(user, verificationUrl)
    @user = user
    @verificationUrl = verificationUrl
    mail(to: @user.unverified_email, subject: "Email Verification for Haigy.com")
  end
  
  
  def verifyEditEmail(user, verificationUrl)
    @user = user
    @verificationUrl = verificationUrl
    mail(to: @user.unverified_email, subject: "Email Verification for Haigy.com")
  end
  
  
  def retrievePassword(user, temporaryPassword)
    @user = user
    @temporaryPassword = temporaryPassword
    mail(to: @user.email, subject: "Password Retrieve for Haigy.com")
  end
end
