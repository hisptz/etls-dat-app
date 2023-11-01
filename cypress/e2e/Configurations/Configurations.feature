Feature: Configuration features

  Scenario: User navigates to configuration
    When the user clicks on the "configuration" page
    Then the user should be navigated to the "configuration" page


  Scenario: User performs program mappping
    When the user clicks on the "configuration" page
    And the user clicks on the "program mapping" tab
    Then user waits for "3" seconds
    And the user clicks on the "Edit" button
    And inputs the "select" field "mappedTbProgram" as "tj4u1ip0tTF"
    And inputs the "select" field "firstName" as "iAaQt0MfyFj"
    And inputs the "select" field "surname" as "yaNdF4auOw6"
    And inputs the "select" field "tbDistrictNumber" as "aihxG1tTqba"
    And inputs the "select" field "age" as "ycm08j1RuKr"
    And inputs the "select" field "sex" as "lYMzXiSb00n"
    And inputs the "select" field "regimen" as "JjySGEpaVza"
    And inputs the "select" field "phoneNumber" as "b11aBXG3igq"
    And inputs the "select" field "deviceIMEInumber" as "ayhQ0Uu3DHx"
    And inputs the "text" field "mediatorUrl" as "https://evrimed.wisepill.com/api/v1"
    And inputs the "text" field "apiKey" as "davedavedavedave"
    And the user clicks on the "Save" button


 Scenario: User adds a device
    When the user clicks on the "configuration" page
    And the user clicks on the "dat device lists" tab
    And the user clicks on the "Add Device" button
    And inputs the device as "3290212112989132"
    And the user saves the device
    Then the devices list should be updated succesfully

  Scenario: User edits a device
    When the user clicks on the "configuration" page
    And the user clicks on the "dat device lists" tab
    And the user clicks on the Edit icon
    And edits the device as "32902121177777777"
    And the user saves the device
    Then the devices list should be updated succesfully

    Scenario: User deletes a device
    When the user clicks on the "configuration" page
    And the user clicks on the "dat device lists" tab
    And the user clicks on the Delete icon
    And the user clicks on the "Delete" button
   Then the devices list should be updated succesfully


 Scenario: User adds a regimen setting
    When the user clicks on the "configuration" page
    And the user clicks on the "regimen setup" tab
    And the user clicks on the "Add Setting" button
    # And the user saves the device
    # Then the devices list should be updated succesfully

  

