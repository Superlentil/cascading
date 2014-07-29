class LoginSessionsController < ApplicationController
  respond_to :json
  
  
  def create
    inputParams = loginParams
    user = User.where(email: inputParams[:email]).first
    if user && user.password == inputParams[:password]
      session[:user_id] = user.id
      session[:user_nickname] = user.nickname
      session[:user_avatar_url] = user.avatar.url(:thumb)
    end
  end


  def destroy
    session.delete(:user_id)
    session.delete(:user_nickname)
    session.delete(:user_avatar_url)
  end
  

private
  def loginParams
    params.require(:login_session).permit(:email, :password)
  end
  
end
