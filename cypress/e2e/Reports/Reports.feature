 Feature: Reports features
 
 Scenario: User queries for a report
  Given an authorized user
    When the user clicks on the "reports" page
    And the user clicks on the "TB Program" tab
    Then user waits for "3" seconds
    And the user selects the reports options
    And the user selects report type "<reportType>"
    And the user selects the organisation units options
    And the user selects the periods options
    Then user waits for "<waitTime>" seconds
    Then the report should be visible 


   Examples:
    | reportType               | waitTime |
    | TB Adherence Report      | 30       |
    | Patients Who Missed Doses| 40       |
  


 Scenario: DAT Device Summary Report
  Given an authorized user
  When the user clicks on the "reports" page
  And the user clicks on the "TB Program" tab
  Then user waits for "3" seconds
   And the user selects the reports options
  And the user selects report type "DAT Device Summary Report"
  Then user waits for "20" seconds
  # Then the report should be visible


  Scenario: User downloads a report
  Given an authorized user
    When the user clicks on the "reports" page
    And the user clicks on the "TB Program" tab
    Then user waits for "3" seconds
    And the user selects the reports options
    And the user selects report type "<reportType>"
    And the user selects the organisation units options
    And the user selects the periods options
    Then user waits for "<waitTime>" seconds
    Then the report should be visible 
    And the user clicks on the "Download" button
    Then the user selects download option "<downloadOption>"
     Then user waits for "5" seconds

  

  Examples:
    | reportType               | waitTime | downloadOption |
    | TB Adherence Report      | 30       | excel          |
    | Patients Who Missed Doses| 40       | json           |


