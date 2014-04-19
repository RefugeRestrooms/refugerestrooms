Given(/^I click to edit from restroom Mission Creek Cafe  restroom$/) do
  visit '/restrooms/1'
  click_link 'Contact us about this post!'
end

Then(/^I should see Mission Creek Cafe  restroom in the header$/) do
  expect(page).to have_content('Mission Creek Cafe  restroom')
end

