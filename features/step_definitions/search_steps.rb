When(/^I search for "(.*?)"$/) do |search|
  fill_in 'search', with: search
  find('.searchButton').click
end

When(/^I search from (.*?)$/) do |location|
  mock_location location
  find('.currentLocationButton').click
end
