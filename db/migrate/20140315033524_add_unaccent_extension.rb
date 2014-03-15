class AddUnaccentExtension < ActiveRecord::Migration
  def up
    execute "create extension unaccent"
  end

  def down
    execute "drop extension unaccent"
  end
end
