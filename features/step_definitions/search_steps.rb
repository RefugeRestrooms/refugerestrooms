When(/^I search for "(.*?)"$/) do |search|
  fill_in 'search', with: search
  find('.searchButton').click
end

When(/^I search from Vancouver$/) do
  mock_location 'Vancouver'
  find('.currentLocationButton').click
end
