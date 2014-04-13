Then(/^I should see that I am at (.*)$/) do |address|
  expect(page).to have_field('restroom[street]', with: address)
end

Then(/^I should see that I am in ([^,]*), ([^,]*), ([^,]*)$/) do |city, region, country|
  expect(page).to have_field('restroom[city]', with: city)
  expect(page).to have_field('restroom[state]', with: region)
  expect(page).to have_field('restroom[country]', with: country)
end
