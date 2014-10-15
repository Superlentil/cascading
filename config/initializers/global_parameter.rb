class GlobalConstant
  class ArticleStatus   # If this enumeration needs to be modified, please modify the corresponding one in the "Javascript" code together.
    INITIAL_TEMPORARILY_CREATED = 0
    DRAFT = 1
    PRIVATE_PUBLISHED = 2
    PUBLIC_PUBLISHED = 3
  end
  
  
  class ArticleCategoryType
    PREDEFINED = 0
    CUSTOMIZED = 1
  end
  
  
  class UserTier   # If this enumeration needs to be modified, please modify the corresponding one in the "Javascript" code together.
    ADMINISTRATOR = 0
    FREE_USER = 1
  end
  
  
  class Resource
    class Picture
      DATA_GENERATOR_PATH = Rails.root.join("resource", "picture", "data_generator")
      DEFAULT_USER_AVATAR_PATH = Rails.root.join("resource", "picture", "default_user_avatar.jpg")
    end
  end
end