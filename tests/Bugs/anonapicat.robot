*** Settings ***
Library		Selenium2Library
Suite Setup 	Go to homepage
Suite Teardown 	Close All Browsers

*** Variables ***
${BROWSER} 	chrome
${HOMEPAGE} 	http://localhost:3000

*** Test Cases ***
APIs sorting
	confirm page loaded	Users
	Go to api catalog
	apis sorting

*** Keywords *** 
Go to homepage
	Open Browser	${HOMEPAGE} 	${BROWSER}

Go to api catalog
	Click Element	id=frontpage-button
	confirm page loaded	Users
	Click Element	id=apis-button
	confirm page loaded	Sort by

Apis sorting
	Select From List By Value	id=sort-select	bookmarkCount
	Location Should Contain	By=bookmark
	Click Element	id=sortDirection-descending
	Location Should Contain	Direction=descending
	Select From List By Value	id=sort-select	created_at
	Location Should Contain	By=created
	Click Element	id=sortDirection-ascending
	Location Should Contain	Direction=ascending
	Select From List By Value	id=sort-select	averageRating
	Location Should Contain	By=average
	Select From List By Value	id=sort-select	name
	Location Should Contain	By=name

confirm page loaded
	[Arguments] 	${searchkey}
	Wait Until Page Contains 	${searchkey}

Logout of apinf
	Click Element 	id=footer-signout