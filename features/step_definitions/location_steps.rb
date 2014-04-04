Given(/^I am in Vancouver$/) do
  location = locations[:Vancouver]
  page.execute_script "navigator.geolocation = {getCurrentPosition: function(success) { success({coords: {latitude: #{location[:latitude]}, longitude: #{location[:longitude]}}}); }}"
end
