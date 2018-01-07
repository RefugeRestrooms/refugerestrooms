When(/^I search for "(.*?)"$/) do |search|
  fill_in 'search', with: search
  find('.submit-search-button').click
end

When(/^I search from (.*?)$/) do |location|
  mock_location location
  find('.current-location-button').click
end

Then(/^the search buttons should have ARIA labels$/) do
 expect(find('button.submit-search-button')['aria-label']).to be_truthy
 expect(find('button.current-location-button')['aria-label']).to be_truthy
end
