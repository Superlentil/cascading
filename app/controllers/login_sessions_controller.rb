class LoginSessionsController < ApplicationController
  respond_to :json
  
  
  def create
    inputParams = loginParams
    
    case inputParams[:type] when "sign in"
      user = User.where(email: inputParams[:email]).first
      if user && user.password == inputParams[:password]
        session[:user_id] = user.id
        session[:user_nickname] = user.nickname
        session[:user_avatar_url] = user.avatar.url(:thumb)
        session[:user_tier] = user.tier
      end
    when "sign out"
      session.delete(:user_id)
      session.delete(:user_nickname)
      session.delete(:user_avatar_url)
      session.delete(:user_tier)
    end
  end
  

private
  def loginParams
    params.require(:login_session).permit(:email, :password, :type)
  end
  
end
