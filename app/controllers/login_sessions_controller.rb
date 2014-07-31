class LoginSessionsController < ApplicationController
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
  def create
    inputParams = loginParams
    
    case inputParams[:type] when "log in"
      user = User.where(email: inputParams[:email]).first
      if user && user.password == inputParams[:password]
        setUserLoginSession(user)
      else
        setUserLoginStatus("Username or password is not correct.")
      end
    when "log out"
      clearUserLoginSession
    end
    
    return
  end
  

private
  def loginParams
    params.require(:login_session).permit(:email, :password, :type)
  end
  
end
