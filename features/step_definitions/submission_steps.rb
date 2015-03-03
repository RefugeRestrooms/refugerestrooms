Given(/^I submit a restroom in Vancouver$/) do
  visit "/"
  click_link "Submit a New Restroom"

  fill_in "restroom[name]", with: "Vancouver restroom"
  fill_in "restroom[street]", with: "684 East Hastings"
  fill_in "restroom[city]", with: "Vancouver"
  fill_in "restroom[state]", with: "British Columbia"
  find(:select, "Country").first(:option, "Canada").select_option
  click_button "Save Restroom"
end

Then(/^I should see that the restroom has been created$/) do
  expect(page).to have_content("A new restroom entry has been created for")
end

When(/^I submit a spam restroom$/) do
  visit '/'
  click_link 'Submit a New Restroom'

  fill_in 'restroom[name]', with: 'Spam restroom'
  fill_in 'restroom[street]', with: 'Spamstreet'
  fill_in 'restroom[city]', with: 'Spamland'
  fill_in 'restroom[state]', with: 'Spamstate'
  find('#restroom_country').find(:xpath, "option[contains(., 'Canada')][1]").select_option
  click_button 'Save Restroom'
end

When(/^I am in (.*) and I guess my location on the submission page$/) do |city|
  visit "/"
  click_link "Submit a New Restroom"

  mock_location(city.to_sym)

  find(".guess-btn").click
end

Then(/^I should see a spam rejection message$/) do
  expect(page).to have_content("Your submission was rejected as spam.")
end
