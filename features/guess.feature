@javascript
Feature: Guess location
  Scenario: Guess in Oakland
    When I am in Oakland and I guess my location on the submission page
    Then I should see that I am at 1400 Broadway
    And I should see that I am in Oakland, California, United States

  Scenario: Guess from Canada
    When I am in Winnipeg and I guess my location on the submission page
    Then I should see that I am at 91 Albert Street
    And I should see that I am in Winnipeg, Manitoba, Canada

    When I am in Vancouver and I guess my location on the submission page
    Then I should see that I am at 678 East Hastings Street
    And I should see that I am in Vancouver, British Columbia, Canada
