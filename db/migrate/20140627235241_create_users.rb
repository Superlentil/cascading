class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :email
      t.string :password_hash
      t.string :nickname
      t.attachment :avatar
      t.integer :tier, default: GlobalConstant::UserTier::FREE_USER

      t.timestamps
    end
    add_index :users, :email, unique: true
  end
end
