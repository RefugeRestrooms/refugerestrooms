Given(/^I submit a restroom in Vancouver$/) do
  visit '/'
  click_link 'Submit a New Bathroom'

  fill_in 'bathroom[name]', with: 'Vancouver restroom'
  fill_in 'bathroom[street]', with: '684 East Hastings'
  fill_in 'bathroom[city]', with: 'Vancouver'
  fill_in 'bathroom[state]', with: 'British Columbia'
  find('#bathroom_country').find(:xpath, "option[contains(., 'Canada')][1]").select_option
  click_button 'Save Bathroom'
end

When(/^I am in Winnipeg and I guess my location on the submission page$/) do
  visit '/'
  click_link 'Submit a New Bathroom'

  mock_location(:Winnipeg)

  find('#guess').click
end
