class PicturesController < ApplicationController
  def index
    @picture = Picture.new
    @pictures = Picture.all
  end


  def show
  end


  def create
    @picture = Picture.create(pictureParams)
    redirect_to pictures_path
    return
  end


  def update
  end


  def destroy
  end

  
  
private
  def pictureParams
    params.require(:picture).permit(:src)
  end
end
