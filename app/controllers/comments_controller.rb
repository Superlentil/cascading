class CommentsController < ApplicationController
  include ApplicationHelper
  
  
  respond_to :json
  
  
  def index
    articleId = params[:article_id]
    unless articleId.nil?
      @comments = Comment.where(article_id: articleId).order(id: :desc)
      respond_with @comments
    end
  end

  def create
    @comment = Comment.new(commentParams)
    if @comment.save
      respond_with @comment
    else
      setResponseMessage("error", "Fail to create comment!")
    end
  end

  def update
    @comment = Comment.find(params[:id])
    if @comment.update(commentParams)
      respond_with @comment
    else
      setResponseMessage("error", "Fail to update comment!")
    end
  end

  def destroy
    @comment = Comment.find(params[:id])
    if @comment.destroy
      respond_with @comment
    else
      setResponseMessage("error", "Fail to destroy comment!")
    end
  end
  
  
private
  def commentParams
    params.require(:comment).permit(:content, :article_id, :user_id, :user_nickname, :user_avatar_url)
  end
end
