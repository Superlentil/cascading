class CategoriesController < ApplicationController
  respond_to :json
  
  
  def predefined
    @predefinedCategories = Category.where(type: GlobalConstant::ArticleCategoryType::PREDEFINED)
    respond_with @predefinedCategories
  end
    
  
  def index
    @categories = Category.all.order(:article_count)
    respond_with @categories
  end

  def create
  end

  def update
  end

  def destroy
  end
end
