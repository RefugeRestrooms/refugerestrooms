class ChangeAccessibileAndUnisexToBoolean < ActiveRecord::Migration
  def up
    connection.execute(%q{
      ALTER TABLE restrooms ALTER access TYPE bool
      USING CASE WHEN access=0 THEN FALSE
                 ELSE TRUE END;

      ALTER TABLE restrooms ALTER bath_type TYPE bool
      USING CASE WHEN bath_type=0 THEN FALSE
                 ELSE TRUE END;
    })

    change_table :restrooms do |t|
      t.rename :access, :accessibile
      t.rename :bath_type, :unisex
    end
  end

  def down
    change_table :restrooms do |t|
      t.rename :accessibile, :access
      t.rename :unisex, :bath_type
    end

    connection.execute(%q{
      ALTER TABLE restrooms ALTER access DROP DEFAULT;
      ALTER TABLE restrooms ALTER access TYPE integer
      USING CASE WHEN access=TRUE THEN 1
                 ELSE 0 END;

      ALTER TABLE restrooms ALTER bath_type DROP DEFAULT;
      ALTER TABLE restrooms ALTER bath_type TYPE integer
      USING CASE WHEN bath_type=TRUE THEN 1
                 ELSE 0 END;
    })
  end
end
