@javascript
Feature: Preview a restroom's location

  Scenario: Preview a restroom before submitting
    Given I have filled out the address information
    When I click the preview button
    Then I should see the map preview