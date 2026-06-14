require 'spec_helper'

describe 'restrooms', :js do
  describe 'submission' do
    it 'adds a restroom when submitted' do
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

    it 'blocks a spam submission' do
      visit root_path
      click_link 'Submit a New Restroom'
      fill_in 'restroom[name]', with: 'Spam restroom'
      fill_in 'restroom[street]', with: 'Spamstreet'
      fill_in 'restroom[city]', with: 'Spamland'
      fill_in 'restroom[state]', with: 'Spamstate'
      find_by_id('restroom_country').find(:xpath, "option[contains(., 'Canada')][1]").select_option
      click_button 'Save Restroom'

      expect(page).to have_content("Your submission was rejected as spam.")
    end

    it 'guesses my location' do
      visit "/"
      click_link "Submit a New Restroom"
      mock_location("Oakland")

      click_button 'Guess current location'
      page.driver.wait_for_network_idle

      expect(page).to have_field('restroom[street]', with: "1400 Broadway")
      expect(page).to have_field('restroom[city]', with: "Oakland")
      expect(page).to have_field('restroom[state]', with: "California")
    end
  end

  describe 'search' do
    it 'searches for text from the splash page' do
      create(:restroom, :geocoded, name: 'Mission Creek Cafe')

      visit root_path
      fill_in 'search', with: 'San Francisco'
      click_button 'Search'

      expect(page).to have_content 'Mission Creek Cafe'
    end

    it 'can search for location from the splash page' do
      create(:oakland_restroom, name: "Some Cafe")

      visit root_path
      mock_location "Oakland"
      click_button 'Search by Current Location'

      expect(page).to have_content 'Some Cafe'
    end

    it 'can search from the splash page with a screen reader' do
      visit root_path

      expect(find('button.submit-search-button')['aria-label']).to be_truthy
      expect(find('button.current-location-button')['aria-label']).to be_truthy
    end

    it 'displays a map' do
      create(:oakland_restroom)

      visit root_path
      mock_location "Oakland"
      find('.current-location-button').click
      expect(page).to have_css(".map-toggle-btn", visible: :visible)

      find('.map-toggle-btn').click

      expect(page).to have_css('#mapArea.loaded')
      expect(page).to have_css("#mapArea [role=button][aria-label='1']")
    end
  end

  describe 'preview' do
    it 'can preview a restroom before submitting' do
      visit "/"
      click_link "Submit a New Restroom"
      fill_in "restroom[name]", with: "Vancouver restroom"
      fill_in "restroom[street]", with: "684 East Hastings"
      fill_in "restroom[city]", with: "Vancouver"
      fill_in "restroom[state]", with: "British Columbia"
      find(:select, "Country").first(:option, "Canada").select_option

      click_button "Preview"

      expect(page).to have_css("div#mapArea", visible: :visible)
      expect(page).to have_css("div#mapArea [title='Current Location']", visible: :visible)
    end
  end

  describe 'nearby restroom' do
    it 'shows nearby restrooms when they exist' do
      create(:oakland_restroom)
      visit "/"
      click_link "Submit a New Restroom"
      mock_location "Oakland"

      find(".guess-btn").click

      expect(page).to have_css(".nearby-container .listItem", visible: :visible)
    end

    it "does not show nearby restrooms when they don't exist" do
      visit "/"
      click_link "Submit a New Restroom"
      mock_location "Oakland"

      find(".guess-btn").click

      expect(page).to have_css(".nearby-container .none", visible: :visible)
    end
  end

  describe "edit" do
    it "creates an edit listing" do
      restroom = create(:restroom)
      visit "/restrooms/#{restroom.id}"
      click_link "Propose an edit to this listing."

      fill_in "restroom[directions]", with: "This is an edit"
      click_button "Save Restroom"

      expect(page).to have_content("Your edit has been submitted.")
      expect(Restroom.where(edit_id: restroom.id).size).to eq(2)
    end
  end

  describe "prefill" do
    it "prefills the new-restroom form from URL params" do
      visit "/restrooms/new?restroom[name]=Powell's Books" \
            "&restroom[street]=1005 W Burnside St" \
            "&restroom[city]=Portland&restroom[state]=OR"

      expect(page).to have_field('restroom[name]', with: "Powell's Books")
      expect(page).to have_field('restroom[street]', with: "1005 W Burnside St")
      expect(page).to have_field('restroom[city]', with: "Portland")
      expect(page).to have_field('restroom[state]', with: "OR")
    end

    it "renders a blank form when no params are given" do
      visit "/restrooms/new"

      expect(page).to have_field('restroom[name]', with: "")
    end

    it "safely ignores a malformed (non-hash) restroom param" do
      visit "/restrooms/new?restroom=foo"

      expect(page).to have_field('restroom[name]', with: "")
    end
  end

  describe "vote" do
    it "shows 'Not yet rated' message initially" do
      restroom = create(:restroom, upvote: 0, downvote: 0)

      visit "/restrooms/#{restroom.id}"

      expect(page).to have_content("Not yet rated")
    end

    it "can downvote" do
      restroom = create(:restroom, upvote: 0, downvote: 0)

      visit "/restrooms/#{restroom.id}"
      click_button "Thumbs Down"

      expect(page).to have_content("0% positive")
    end

    it "can upvote" do
      restroom = create(:restroom, upvote: 0, downvote: 0)

      visit "/restrooms/#{restroom.id}"
      click_button "Thumbs Up"

      expect(page).to have_content("100% positive")
    end
  end
end
