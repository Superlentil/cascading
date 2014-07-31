module LoginSessionsHelper
  def clearLoginSession
    cookies.delete(:user_id)
    cookies.delete(:user_nickname)
    cookies.delete(:user_avatar_url)
    cookies.delete(:user_login_status)
    
    session.delete(:user_id)
    session.delete(:user_tier)
  end
  
  
  def administrator?
    return session.has_key?(:user_tier) && session[:user_tier].to_i == GlobalConstant::UserTier::ADMINISTRATOR
  end
end
