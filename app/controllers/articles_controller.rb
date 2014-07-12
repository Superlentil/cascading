class ArticlesController < ApplicationController
  respond_to :json
  
  
  def index
    @articles = Article.all
    respond_with @articles
    return
  end
  

  def show
    @article = Article.find(params[:id])
    respond_with @article
    return
  end


  def create
    @article = Article.new(articleParams)
    @article.save
    session[:NAME] = "Dingyu Zhou"
    session[:SEX] = "male"
    session[:BIRTH_YEAR] = 1986
    cookies[:name] = "Dingyu Zhou"
    cookies[:sex] = "male"
    cookies[:birth_year] = 1986
    respond_with @article
    return
  end


  def update
    @article = Article.find(params[:id])
    @article.update(articleParams)
    respond_with @article
    return
  end


  def destroy
    @article = Article.find(params[:id])
    @article.destroy
    respond_with @article
    return
  end


private
  def articleParams
    params.require(:article).permit(:title, :author, :content, :category, :id, :views, :like, :user_id, :created_at, :updated_at)
  end
end
