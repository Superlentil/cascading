module LoginSessionsHelper
  def setUserLoginSession(user)
    cookies[:user_id] = user.id.to_i
    cookies[:user_nickname] = user.nickname
    cookies[:user_avatar_url] = user.avatar.url(:thumb)
    cookies[:user_login_status] = "success"
    
    session[:user_id] = user.id.to_i
    session[:user_tier] = user.tier.to_i
  end
  
  
  def setUserLoginStatus(status)
    cookies[:user_login_status] = status
  end
  
  
  def clearUserLoginSession
    cookies.delete(:user_id)
    cookies.delete(:user_nickname)
    cookies.delete(:user_avatar_url)
    cookies.delete(:user_login_status)
    
    session.delete(:user_id)
    session.delete(:user_tier)
  end
  
  
  def administrator?
    return session.has_key?(:user_tier) && session[:user_tier] == GlobalConstant::User::Tier::ADMINISTRATOR
  end
  
  
  def loggedIn?
    return session.has_key?(:user_id)
  end
  
  
  def correctLoggedInUser?(userId)
    return session.has_key?(:user_id) && session[:user_id] == userId.to_i
  end
end
