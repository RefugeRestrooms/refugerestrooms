@javascript
Feature: Submit a restroom

  Scenario: Submit a restroom manually
    When I submit a restroom in Vancouver
    Then I should see that the restroom has been created

   Scenario: Block a spam submission
     When I submit a spam restroom
     Then I should see a spam rejection message
