require 'bcrypt'


class User < ActiveRecord::Base
  include BCrypt


  belongs_to :tier

  
  def password
    @password ||= Password.new(password_hash)
  end


  def password=(new_password)
    @password = Password.create(new_password)
    self.password_hash = @password
  end
  
end