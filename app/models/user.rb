require 'bcrypt'


class User < ActiveRecord::Base
  include BCrypt
  
  
  has_many :articles, dependent: :destroy
  
  
  has_attached_file :avatar, :styles => { :medium => "300x300>", :thumb => "49x49^" },
    :convert_options => {:thumb => "-gravity center -extent 49x49"},
    :default_url => "/images/:style/missing.png",
    :path => ":rails_root/public/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :url => "/system/:class/:attachment/:id_partition/:style/:id.:extension",
    :use_timestamp => false
  
  
  validates_attachment_content_type :avatar, :content_type => /\Aimage\/.*\Z/
  
  
  validates :email, uniqueness: true


###### Local Constants ######
  DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES = "{{;}}"
  DELIMITER_INSIDE_TEMPORARY_IDENTITY_HASH = "{{:}}"
  TEMPORARY_IDENTITY_HASHES_LENGTH_LIMIT = 2000
  
  EMAIL_VERIFICATION_CODE = "0"
  TEMPORARY_PASSWORD = "1"
#############################

  
  def password=(newPassword)
    @password = Password.create(newPassword)
    self.password_hash = @password
  end
  
  
  def password
    @password ||= Password.new(password_hash)
  end
  
  
  def verificationCode=(newVerificationCode)
    insertNewTemporaryIdentity(newVerificationCode, EMAIL_VERIFICATION_CODE)
  end
  
  
  def validVerificationCode?(inputVerificationCode)
    return validTemporaryIdentity?(inputVerificationCode, EMAIL_VERIFICATION_CODE)
  end
  
  
  def resetVerificationCode
    resetTemporaryIdentities
  end
  
  
  def temporaryPassword=(newTemporaryPassword)
    insertNewTemporaryIdentity(newTemporaryPassword, TEMPORARY_PASSWORD)
  end
  
  
  def validTemporaryPassword?(inputTemporaryPassword)
    return validTemporaryIdentity?(inputTemporaryPassword, TEMPORARY_PASSWORD)
  end
  
  
  def resetTemporaryPassword
    resetTemporaryIdentities
  end
  

private
  # "temporary_identity_hashes" should be in the format of:
  # EXPIRE_TIME{{:}}TYPE{{:}}TEMPORARY_IDENTITY_HASH{{;}}EXPIRE_TIME{{:}}TYPE{{:}}TEMPORARY_IDENTITY_HASH{{;}} ...
  def insertNewTemporaryIdentity(newTemporaryIdentity, identityType)
    newTemporaryIdentityHash = Password.create(newTemporaryIdentity)
    expireTime = Time.now + GlobalConstant::User::TEMPORARY_IDENTITY_LIFETIME_IN_SECOND
    
    oldTemporaryIdentityHashes = self.temporary_identity_hashes
    self.temporary_identity_hashes = "#{expireTime.to_i}#{DELIMITER_INSIDE_TEMPORARY_IDENTITY_HASH}#{identityType}#{DELIMITER_INSIDE_TEMPORARY_IDENTITY_HASH}#{newTemporaryIdentityHash}#{DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES}"
    
    unless oldTemporaryIdentityHashes.nil? || oldTemporaryIdentityHashes.empty?
      oldTemporaryIdentityHashes = oldTemporaryIdentityHashes.split(DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES)
      currentTime = Time.now.to_i
      delimiterLength = DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES.length

      oldTemporaryIdentityHashes.each do |hash|
        temporaryIdentity = hash.split(DELIMITER_INSIDE_TEMPORARY_IDENTITY_HASH)
        if temporaryIdentity.length == 3
          if temporaryIdentity[0].to_i > currentTime
            if self.temporary_identity_hashes.length + hash.length + delimiterLength > TEMPORARY_IDENTITY_HASHES_LENGTH_LIMIT
              break
            else
              self.temporary_identity_hashes << hash << DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES
            end
          else
            break
          end
        end
      end
    end
  end
  
  
  def validTemporaryIdentity?(inputIdentity, identityType)
    unless self.temporary_identity_hashes.nil? || self.temporary_identity_hashes.empty?
      temporaryIdentityHashes = self.temporary_identity_hashes.split(DELIMITER_BETWEEN_TEMPORARY_IDENTITY_HASHES)
      currentTime = Time.now.to_i
      temporaryIdentityHashes.each do |hash|
        temporaryIdentity = hash.split(DELIMITER_INSIDE_TEMPORARY_IDENTITY_HASH)
        if temporaryIdentity.length == 3
          if temporaryIdentity[0].to_i > currentTime
            if temporaryIdentity[1] == identityType && Password.new(temporaryIdentity[2]) == inputIdentity
              return true
            end
          else
            return false
          end
        end
      end
    end
    return false
  end
  
  
  def resetTemporaryIdentities
    self.temporary_identity_hashes = ""
  end
end
