class GlobalConstant
  class Article
    class Status   # If this enumeration needs to be modified, please modify the corresponding one in the "Javascript" code together.
      INITIAL_TEMPORARILY_CREATED = 0
      DRAFT = 1
      PRIVATE_PUBLISHED = 2
      PUBLIC_PUBLISHED = 3
    end
    
    class CategoryType
      PREDEFINED = 0
      CUSTOMIZED = 1
    end
  end
  
  
  class User
    TEMPORARY_PASSWORD_LIFETIME_IN_SECOND = 660   # set to 11 minutes, and tell user 10 minutes in case of some delay.
    
    class Tier   # If this enumeration needs to be modified, please modify the corresponding one in the "Javascript" code together.
      ADMINISTRATOR = 0
      FREE_USER = 1
    end
    
    class Status   # If this enumeration needs to be modified, please modify the corresponding one in the "Javascript" code together.
      UNVERIFIED = 0
      VERIFIED = 1
    end
  end
  
  
  class Resource
    class Picture
      DATA_GENERATOR_PATH = Rails.root.join("resource", "picture", "data_generator")
      DEFAULT_USER_AVATAR_PATH = Rails.root.join("resource", "picture", "default_user_avatar_20141116.jpg")
    end
  end
end