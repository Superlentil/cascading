class UsersController < ApplicationController
  include ApplicationHelper
  include LoginSessionsHelper
  
  
  respond_to :json  
  
  
  def index
    if administrator?
      @users = User.all
      respond_with @users
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
    @user = User.create(userParams)
    setUserLoginSession(@user)
    respond_with @user
  end


  def update
    @user = User.find(params[:id])
    @user.update(userParams)
    respond_with @user
  end


  def destroy
    @user = User.find(params[:id])
    @user.destroy
    respond_with @user
  end
  
  
private
  def userParams
    params.require(:user).permit(:email, :password, :nickname, :avatar)
  end

end
