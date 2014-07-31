class LoginSessionsController < ApplicationController
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
  def create
    inputParams = loginParams
    
    case inputParams[:type] when "log in"
      user = User.where(email: inputParams[:email]).first
      if user && user.password == inputParams[:password]
        cookies[:user_id] = user.id
        cookies[:user_nickname] = user.nickname
        cookies[:user_avatar_url] = user.avatar.url(:thumb)
        cookies[:user_login_status] = "success"
        
        session[:user_id] = user.id
        session[:user_tier] = user.tier
      else
        cookies[:user_login_status] = "Username or password is not correct."
      end
    when "log out"
      clearLoginSession
    end
    
    return
  end
  

private
  def loginParams
    params.require(:login_session).permit(:email, :password, :type)
  end
  
end
