require 'spec_helper'

describe 'the restroom submission process', type: :feature do
  it 'should add a restroom when submitted' do
    visit root_path
    click_link "Submit a New Restroom"
    fill_in "restroom[name]", with: "Vancouver restroom"
    fill_in "restroom[street]", with: "684 East Hastings"
    fill_in "restroom[city]", with: "Vancouver"
    fill_in "restroom[state]", with: "British Columbia"
    find(:select, "Country").first(:option, "Canada").select_option
    click_button "Save Restroom"

    expect(page).to have_content("A new restroom entry has been created for")
  end

  it 'should block a spam submission' do
    visit root_path
    click_link 'Submit a New Restroom'
    fill_in 'restroom[name]', with: 'Spam restroom'
    fill_in 'restroom[street]', with: 'Spamstreet'
    fill_in 'restroom[city]', with: 'Spamland'
    fill_in 'restroom[state]', with: 'Spamstate'
    find('#restroom_country').find(:xpath, "option[contains(., 'Canada')][1]").select_option
    click_button 'Save Restroom'

    expect(page).to have_content("Your submission was rejected as spam.")
  end
end

describe 'the restroom search process', type: :feature, js: true do
  it 'should search for text from the splash page' do
    create(:restroom, name: 'Mission Creek Cafe')

    visit root_path
    fill_in 'search', with: 'San Francisco'
    find('.submit-search-button').click

    expect(page).to have_content 'Mission Creek Cafe'
  end

  it 'should search for location from the splash page' do
    #Given a restroom exists in Winnipeg
    #When I am on the splash page
    #And I search from Vancouver
    #Then I should not see a restroom
  end

  it 'should search from the splash page with a screen reader' do
    #When I am on the splash page
    #Then the search buttons should have ARIA labels
  end

  it 'should display a map' do
    #Given a restroom exists in Winnipeg
    #When I am on the splash page
    #And I search from Winnipeg
    #And I show the map
    #Then I should see a restroom on the map
  end
end

