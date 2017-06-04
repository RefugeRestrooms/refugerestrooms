# This script loads the sample data in "db/rr-data-austin.json".
# To use, run:
#	bin/rails console
# Within the console run:
#	load "script/load-data-austin.rb"
#

require 'json'

File.open("db/rr-data-austin.json") do |fp|
	Restroom.transaction do
		JSON.load(fp).each do |rec|
			rec['id'] = nil
			rec.delete('distance')
			rec.delete('bearing')
			Restroom.create(rec)
		end
	end
end

