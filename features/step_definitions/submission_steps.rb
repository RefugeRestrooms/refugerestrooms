Given(/^I submit a restroom in Vancouver$/) do
  visit '/'
  click_link 'Submit a New Restroom'

  fill_in 'restroom[name]', with: 'Vancouver restroom'
  fill_in 'restroom[street]', with: '684 East Hastings'
  fill_in 'restroom[city]', with: 'Vancouver'
  fill_in 'restroom[state]', with: 'British Columbia'
  find(:select, 'Country').first(:option, 'Canada').select_option
  click_button 'Save Restroom'
end

Then(/^I should see that the restroom has been created$/) do
  expect(page).to have_content("A new restroom entry has been created for")
end

When(/^I am in (.*) and I guess my location on the submission page$/) do |city|
  visit '/'
  click_link 'Submit a New Restroom'

  mock_location(city.to_sym)

  find('#guess').click
end
