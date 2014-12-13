class CreateUsers < ActiveRecord::Migration
  def change
    create_table :users do |t|
      t.string :email
      t.string :unverified_email, default: ""
      t.string :password_hash
      t.text :temporary_identity_hashes, limit: 2000   # be able to hold 20 temporary passwords
      t.string :nickname
      t.attachment :avatar
      t.integer :tier, default: GlobalConstant::User::Tier::FREE_USER
      t.integer :status, default: GlobalConstant::User::Status::UNVERIFIED

      t.timestamps
    end
    add_index :users, :email, unique: true
    add_index :users, :unverified_email
  end
end
