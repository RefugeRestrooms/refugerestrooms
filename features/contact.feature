@javascript
Feature: Request a contact form

  Scenario: Request from restroom
    Given I submit a restroom in Vancouver
    And I click to edit from restroom Vancouver restroom
    Then I should be at the contact page with restroom_id and restoom_name queries
    And I should see Vancouver restroom in the header
