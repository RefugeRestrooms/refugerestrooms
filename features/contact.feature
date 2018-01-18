Feature: Request a contact form
  Scenario: Request generic contact from restroom
    Given I click to contact from restroom Mission Creek Cafe
    Then I should not see Mission Creek Cafe in the header
