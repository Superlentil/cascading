require 'bcrypt'


class User < ActiveRecord::Base
  include BCrypt
  
  
  has_many :articles, dependent: :destroy
  
  
  has_attached_file :avatar, :styles => { :medium => "300x300>", :thumb => "50x50^" },
    :convert_options => {:thumb => "-gravity center -extent 50x50"},
    :default_url => "/images/:style/missing.png"
  
  
  validates_attachment_content_type :avatar, :content_type => /\Aimage\/.*\Z/

  
  def password
    @password ||= Password.new(password_hash)
  end


  def password=(new_password)
    @password = Password.create(new_password)
    self.password_hash = @password
  end
  
end
