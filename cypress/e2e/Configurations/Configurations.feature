Feature: Configuration features


  Scenario: User performs program mappping
  Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "program mapping" tab
    Then user waits for "3" seconds
    And the user clicks on the "Add Mapping" button
    And inputs the "select" field "program" as "tj4u1ip0tTF"
    And inputs the "text" field "name" as "Cypress Testing"
    And inputs the "select" field "attributes.firstName" as "iAaQt0MfyFj"
    And inputs the "select" field "attributes.surname" as "yaNdF4auOw6"
    And inputs the "select" field "attributes.patientNumber" as "aihxG1tTqba"
    And inputs the "select" field "attributes.age" as "ycm08j1RuKr"
    And inputs the "select" field "attributes.sex" as "lYMzXiSb00n"
    And inputs the "select" field "attributes.regimen" as "JjySGEpaVza"
    And inputs the "select" field "attributes.phoneNumber" as "b11aBXG3igq"
    And inputs the "text" field "mediatorUrl" as "https://evrimed.wisepill.com/api/v1"
    And inputs the "text" field "apiKey" as "davedave"
    And the user clicks on the "Save" button


  Scenario: User deletes a program mapping
    Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "program mapping" tab
    And the user clicks on the Delete icon of the program mapping
    And the user clicks on the "Delete" button
    Then the list should be updated succesfully



 Scenario: User adds a device
 Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "dat device lists" tab
    And the user clicks on the "Add Device" button
    And inputs the "text" field "IMEI" as "cypress-testing-111111"
    And the user clicks on the "Save" button
    Then the list should be updated succesfully

  Scenario: User searches for a device and deletes it
  Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "dat device lists" tab
    And inputs the "text" field "deviceIMEINumber" as "cypress-testing-111111"
    And the user clicks on the "Search" button
    And the user clicks on the Delete icon
    And the user clicks on the "Delete" button
    Then the list should be updated succesfully
  

 Scenario: User adds a regimen setting
 Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "regimen setup" tab
    And the user clicks on the "Add Setting" button
    And inputs the "select" field "regimen" as "PB(C)"
    And inputs the "select" field "administration" as "Daily"
    And inputs the "text" field "numberOfDoses" as "777"
    And the user clicks on the "Save" button
    Then the list should be updated succesfully

    Scenario: User deletes a regimen setting
    Given an authorized user
    When the user clicks on the "configuration" page
    And the user clicks on the "regimen setup" tab
     And the user clicks on the Delete icon of the regimen setting
    And the user clicks on the "Delete" button
    Then the list should be updated succesfully

  

