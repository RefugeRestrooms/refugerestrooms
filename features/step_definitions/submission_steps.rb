Given(/^I submit a restroom in Vancouver$/) do
  visit '/'
  click_link 'Submit a New Restroom'

  fill_in 'restroom[name]', with: 'Vancouver restroom'
  fill_in 'restroom[street]', with: '684 East Hastings'
  fill_in 'restroom[city]', with: 'Vancouver'
  fill_in 'restroom[state]', with: 'British Columbia'
  find('#restroom_country').find(:xpath, "option[contains(., 'Canada')][1]").select_option
  click_button 'Save Restroom'
end

When(/^I am in (.*) and I guess my location on the submission page$/) do |city|
  visit '/'
  click_link 'Submit a New Restroom'

  mock_location(city.to_sym)

  find('#guess').click
end
