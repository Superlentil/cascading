require 'bcrypt'


class User < ActiveRecord::Base
  include BCrypt
  
  
  has_many :articles, dependent: :destroy
  
  
  has_attached_file :avatar, :styles => { :medium => "300x300>", :thumb => "49x49^" },
    :convert_options => {:thumb => "-gravity center -extent 49x49"},
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/:id.:extension"
  
  
  validates_attachment_content_type :avatar, :content_type => /\Aimage\/.*\Z/

  
  def password
    @password ||= Password.new(password_hash)
  end


  def password=(new_password)
    @password = Password.create(new_password)
    self.password_hash = @password
  end
  
end
