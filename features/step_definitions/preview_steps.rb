Given(/^I have filled out the address information$/) do
  visit "/"
  click_link "Submit a New Restroom"
  fill_in "restroom[name]", with: "Vancouver restroom"
  fill_in "restroom[street]", with: "684 East Hastings"
  fill_in "restroom[city]", with: "Vancouver"
  fill_in "restroom[state]", with: "British Columbia"
  find(:select, "Country").first(:option, "Canada").select_option
end

When(/^I click the preview button$/) do
  find_button("Preview").trigger('click')
end

Then(/^I should see the map preview$/) do
  expect(page).to have_css("div#mapArea", :visible => true)
end
