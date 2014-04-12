@javascript
Feature: Search for restrooms

  Scenario: Text search from splash page
    Given a restroom exists in Winnipeg
    When I am on the splash page
    And I search for "Winnipeg"
    Then I should see a restroom

  Scenario: Location search from splash page
    Given a restroom exists in Winnipeg
    When I am on the splash page
    And I search from Vancouver
    Then I should not see a restroom

  Scenario: Map display
    Given a restroom exists in Winnipeg
    When I am on the splash page
    And I search from Winnipeg
    And I show the map
    Then I should see a restroom on the map
