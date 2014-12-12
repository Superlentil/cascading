class UserMailer < ActionMailer::Base
  default from: "noreply@haigy.com"
  
  
  def welcome(user)
    @user = user
    mail(to: @user.email, subject: 'Welcome to Haigy.com')
  end
end
