@javascript
Feature: Submit a restroom

  Scenario: Submit a restroom manually
    When I submit a restroom in Vancouver

    Given I am on the splash page
    And I search from Vancouver
    Then I should see a restroom
