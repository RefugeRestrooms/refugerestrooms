@javascript
Feature: Search for restrooms

  Scenario: Text search from splash page
    Given a restroom exists in Winnipeg
    When I am on the splash page
    And I search for "Winnipeg"
    Then I should see a restroom

  Scenario: Location search from splash page
    Given a restroom exists in Winnipeg
    And I am in Vancouver
    When I am on the splash page
    And I search from my location
    Then I should not see a restroom
