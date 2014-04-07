@javascript
Feature: Guess location
  Scenario: Guess in Oakland
    When I am in Oakland and I guess my location on the submission page
    Then I should see that I am at 1400 Broadway
    And I should see that I am in Oakland, California, United States
