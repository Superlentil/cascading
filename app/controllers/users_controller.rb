class UsersController < ApplicationController
  respond_to :json  
  
  
  def index
    @users = User.all
    respond_with @users
  end


  def show
    @user = User.find(params[:id])
    respond_with @user
  end


  def create
    @user = User.create(userParams)
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
