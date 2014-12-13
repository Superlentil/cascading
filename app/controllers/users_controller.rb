class UsersController < ApplicationController
  include ApplicationHelper
  include LoginSessionsHelper
  
  
  respond_to :json
  
  
###### Local Constants ######
  VERIFY_SIGN_UP_EMAIL = 0
  VERIFY_EDITED_EMAIL = 1
#############################
  
  
  def index
    if administrator?
      @users = User.all
      respond_with @users
    else
      setResponseMessage("warning", "You don't have the privilege to access the page.")
    end
  end


  def show
    if correctLoggedInUser?(params[:id])
      @user = User.find(params[:id])
    else
      if loggedIn?
        setResponseMessage("warning", "You don't have the privilege to access the page.")
      else
        setResponseMessage("warning", "Please log in first and try to access the page again.")
      end
    end
  end
  
  
  def publicInfo
    @user = User.find(params[:id])
  end


  def create
    inputParams = userParams
    @user = User.new(inputParams)
    @user.status = GlobalConstant::User::Status::UNVERIFIED
    @user.unverified_email = @user.email
    
    if inputParams["avatar"].nil?   # use a default avatar picture if user didn't provide an avatar picture
      file = File.open(GlobalConstant::Resource::Picture::DEFAULT_USER_AVATAR_PATH)
      @user.avatar = file
      file.close
    end
    if @user.save
      setUserLoginSession(@user)
      verifyEmail(@user, VERIFY_SIGN_UP_EMAIL)
    else
      setResponseMessage("error", "Fail to create user!")
    end
  end
  
  
  def verifyEmail(user, action)
    verificationCode = SecureRandom.urlsafe_base64
    verificationUrl = finalizeEmailVerification_user_url(user.id, verification_code: verificationCode)
    user.temporary_password = verificationCode
    user.temporary_password_expire_time = Time.now + GlobalConstant::User::TEMPORARY_PASSWORD_LIFETIME_IN_SECOND
    
    if user.save
      Thread.new {
        begin
          if action == VERIFY_SIGN_UP_EMAIL
            UserMailer.verifySignUpEmail(user, verificationUrl).deliver
          elsif action == VERIFY_EDITED_EMAIL
          end
        rescue
          logger.fatal "Fail to send the verification email."
        end
      }
    else
      logger.fatal "Fail to set user's temporary_password and temporary_password_expire_time."
    end
  end
  
  
  def finalizeEmailVerification
    user = User.find(params[:id])
    if user
      if Time.now < user.temporary_password_expire_time
        if user.temporary_password == params[:verification_code]
          user.status = GlobalConstant::User::Status::VERIFIED
          validEmail = true
          if user.email == user.unverified_email
            user.unverified_email = ""
          else
            if User.exists?(email: user.unverified_email)
              validEmail = false
            else
              user.email = user.unverified_email
              user.unverified_email = ""
            end
          end
          
          if validEmail
            if user.save
              setUserLoginSession(user)
            else
              logger.fatal "Fail to set user's email and status."
            end
          else
            # TODO
            logger.info "email is no longer valid"
          end
        else
          # TODO
          logger.info "verification_code is not correct"
        end
      else
        # TODO
        logger.info "temporary_password expired"
      end
    end
    
    redirect_to root_path
  end


  def update
    @user = User.find(params[:id])
    if correctLoggedInUser?(@user.id)
      if @user.password == params[:user][:verify_password]
        params[:user].delete(:verify_password)
        if @user.update(userParams)
          setUserLoginSession(@user)
        else
          setResponseMessage("error", "Fail to update user!")
        end
      else
        setResponseMessage("error", "Password is not correct!")
        render :json => {fail: "password is not correct"}
      end
    end
  end


  def destroy
    @user = User.find(params[:id])
    if @user.destroy
      clearUserLoginSession
    else
      setResponseMessage("error", "Fail to destroy user!")
    end
  end
  
  
  def emailAvailable
    @available = !User.exists?(email: params[:email])
  end
  
  
private
  def userParams
    params.require(:user).permit(:email, :password, :nickname, :avatar, :tier)
  end

end
