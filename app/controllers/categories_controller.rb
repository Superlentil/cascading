class CategoriesController < ApplicationController
  respond_to :json
  
  
  def predefined
    @predefinedCategories = Category.where(type: GlobalConstant::ArticleCategoryType::PREDEFINED)
    respond_with @predefinedCategories
  end
    
  
  def index
    @categories = Category.all.order(:name)
    respond_with @categories
  end
  
  
  def byUser
    userCategoryId = Article.where(user_id: params[:user_id]).select(:category_id).distinct.pluck(:category_id)
    @categoriesByUser = Category.where(id: userCategoryId).order(:name)
    respond_with @categoriesByUser
  end
  

  def create
  end

  def update
  end

  def destroy
  end
end
