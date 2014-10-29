class UsersController < ApplicationController
  include ApplicationHelper
  include LoginSessionsHelper
  
  
  respond_to :json  
  
  
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
      respond_with @user
    else
      if loggedIn?
        setResponseMessage("warning", "You don't have the privilege to access the page.")
      else
        setResponseMessage("warning", "Please log in first and try to access the page again.")
      end
    end
  end


  def create
    inputParams = userParams
    @user = User.new(inputParams)
    if inputParams["avatar"].nil?   # use a default avatar picture if user didn't provide an avatar picture
      file = File.open(GlobalConstant::Resource::Picture::DEFAULT_USER_AVATAR_PATH)
      @user.avatar = file
      file.close
    end
    if @user.save
      setUserLoginSession(@user)
      respond_with @user
    else
      setResponseMessage("error", "Fail to create user!")
    end
  end


  def update
    @user = User.find(params[:id])
    if correctLoggedInUser?(@user.id)
      if @user.password == params[:user][:verify_password]
        params[:user].delete(:verify_password)
        if @user.update(userParams)
          setUserLoginSession(@user)
          respond_with @user
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
      respond_with @user
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
