 Feature: DAT Assignment features
 
 Scenario: User performs search for a DAT Client for Assignment
 Given an authorized user
    When the user clicks on the "dat-assignment" page
    And the user clicks on the "TB Program" tab
    Then user waits for "5" seconds
    And inputs the "text" field "patientNumber" as "090901106320-5/KK/2023/39"
    And inputs the "text" field "firstName" as "ABREHEMANI"
    And inputs the "text" field "surname" as "MBEDO"
    And the user clicks on the "Select Organisation unit" button
    And the user selects an organisation unit
    And the user clicks on the "Update" button
    And the user clicks on the "Search" button
    Then user waits for "20" seconds
    And the user selects the DAT Client
    Then user waits for "10" seconds


Scenario: User assigns DAT Device to Client
Given an authorized user
    When the user clicks on the "dat-assignment" page
    And the user clicks on the "TPT Program" tab
    Then user waits for "20" seconds
    And the user selects the DAT Client
    Then user waits for "10" seconds
    And the user clicks on the "Edit Device" button
    # And inputs the "select" field "IMEI" as "86742004220708"
    # And the user clicks on the "Save" button
    # Then user waits for "3" seconds
    # Then the client should be updated succesfully
    # Then user waits for "5" seconds


 

