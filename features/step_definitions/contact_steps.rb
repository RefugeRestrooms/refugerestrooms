Given(/^I click to edit from restroom Vancouver restroom$/) do
  visit '/restrooms/1'
  click_link 'Contact us about this post!'
end

Then(/^I should be at the contact page with restroom_id and restoom_name queries$/) do
  assert "#{uri.path}?#{uri.query}" == contact_path(:restroom_id => '1', :restroom_name => 'Vancouver restroom')
end

Then(/^I should see Vancouver restroom in the header$/) do
  expect(page).to have_content('Vancouver restroom')
end

def uri
  URI.parse(current_url)
end
