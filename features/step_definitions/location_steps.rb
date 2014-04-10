Then(/^I should see that I am at (.*)$/) do |address|
  expect(page).to have_field('bathroom[street]', with: address)
end

Then(/^I should see that I am in ([^,]*), ([^,]*), ([^,]*)$/) do |city, region, country|
  expect(page).to have_field('bathroom[city]', with: city)
  expect(page).to have_field('bathroom[state]', with: region)
  expect(page).to have_field('bathroom[country]', with: country)
end
