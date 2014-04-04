@javascript
Feature: Suggest nearby restrooms

  Scenario: Show nearby restrooms when guessing
    Given a restroom exists in Winnipeg
    When I am in Winnipeg and I guess my location on the submission page
    Then I should see an existing restroom nearby

  Scenario: Show absence of nearby restrooms
    When I am in Winnipeg and I guess my location on the submission page
    Then I should not see an existing restroom nearby
