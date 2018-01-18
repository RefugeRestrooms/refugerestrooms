Feature: Edit restroom

  Scenario: Visit a restroom page
    When I am on the restroom page for id 1
    Then I should see the edit link

  Scenario: View an edit
    When I visit the edit page for 'Winnepeg Restroom'
    Then I should see the restroom address

  Scenario: Submit an edit
    When I submit an edit to 'Winnepeg Restroom'
    Then I should see that the edit has been submitted
