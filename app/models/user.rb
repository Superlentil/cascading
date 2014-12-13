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
  
  
  validates :email, uniqueness: true

  
  def password=(newPassword)
    @password = Password.create(newPassword)
    self.password_hash = @password
  end
  
  
  def password
    @password ||= Password.new(password_hash)
  end
  
  
  def temporary_password=(newTemporaryPassword)
    @temporaryPassword = Password.create(newTemporaryPassword)
    self.temporary_password_hash = @temporaryPassword
  end
  
  
  def temporary_password
    @temporaryPassword || Password.new(temporary_password_hash)
  end
end
