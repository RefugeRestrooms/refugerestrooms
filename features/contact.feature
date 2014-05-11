Feature: Request a contact form

  Scenario: Request edit from restroom
    Given I click to edit from restroom Mission Creek Cafe
    Then I should see Mission Creek Cafe in the header

  Scenario: Request generic contact from restroom
    Given I click to contact from restroom Mission Creek Cafe
    Then I should not see Mission Creek Cafe in the header
