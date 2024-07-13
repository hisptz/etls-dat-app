 Feature: DAT Client Overview features
 
 Scenario: User performs search for a DAT Client
  Given an authorized user
    When the user clicks on the "dat-client-overview" page
    And the user clicks on the "TB Program" tab
    Then user waits for "5" seconds
    And inputs the "text" field "patientNumber" as "250301104429-6/KK/2022/145"
    And inputs the "text" field "firstName" as "EDINA"
    And inputs the "text" field "surname" as "KAZOBA"
    And inputs the "text" field "deviceIMEInumber" as "765600049898951"
    And the user clicks on the "Select Organisation unit" button
    And the user selects an organisation unit
    And the user clicks on the "Update" button
    And the user clicks on the "Search" button
    Then user waits for "20" seconds
    And the user selects the DAT Client
    Then user waits for "10" seconds


  Scenario: User sets an alarms for a DAT Client
  Given an authorized user
    When the user clicks on the "dat-client-overview" page
    And the user clicks on the "TPT Program" tab
    Then user waits for "20" seconds
    And the user selects the DAT Client
    Then user waits for "10" seconds
    And the user clicks on the "Set Alarms" button
    Then user switch the "doseReminder" alarm on
    Then user switch the "appointmentReminder" alarm on
    And inputs the "text" field "nextDoseTime" as "09:30"
    Then checks the days of the alarm "Sun,Mon,Tue,Wed,Fri,Sat"
    And inputs the "text" field "nextRefillDate" as "2025-12-01"
    And inputs the "text" field "nextRefillTime" as "10:00"
    And the user clicks on the "Save" button
    Then user waits for "3" seconds
    Then the client should be updated succesfully
     Then user waits for "5" seconds

