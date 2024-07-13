 Feature: Dashboards features
 
 Scenario: User queries for dashboards
  Given an authorized user
    When the user clicks on the "dashboards" page
    And the user clicks on the "TB Program" tab
    Then user waits for "3" seconds
    And the user clicks on the "Add filters" button
    And the user selects the periods options
    And the user clicks on the "Add filters" button
    And the user selects the organisation units options
    And the user clicks on the "Update" button
    Then user waits for "5" seconds
   

  Scenario: User edits the dashboards
  Given an authorized user
    When the user clicks on the "dashboards" page
    And the user clicks on the "TB Program" tab
    Then user waits for "3" seconds
    And the user clicks on the "Edit Dashboard" button
    And inputs the "select" field "dashboardItem" as "rW8KKFur87O"
    And inputs the "text" field "span" as "2"
    Then the user adds the dashboard to the list button
    And the user clicks on the "Save" button
    And user waits for "5" seconds
    Then the added dashboard should be visible



 
  
  


 


