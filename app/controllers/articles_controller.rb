class ArticlesController < ApplicationController
  respond_to :json
  
  
  def index
    @articles = Article.all
    respond_with @articles
    return
  end
  

  def show
  end


  def create
    @article = Article.new(articleParams)
    @article.save
    respond_with @article
    return
  end


  def update
  end


  def destroy
    @article = Article.find(params[:id])
    @article.destroy
    respond_with @article
    return
  end


private
  def articleParams
    params.require(:article).permit(:title, :author, :content, :category)
  end
end
