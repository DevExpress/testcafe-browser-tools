on run (argv)
	if (count of argv) is not equal to 2 then
		error "Incorrect arguments"
	end if
	
	set windowId to (item 1 of argv as integer)
	set bundleId to (item 2 of argv as string)
	
	tell application id bundleId to set {winLeft, winTop, winRight, winBottom} to bounds of window id windowId
	
	set windowWidth to (winRight - winLeft) as string
	set windowHeight to (winBottom - winTop) as string
	
	return windowWidth & linefeed & windowHeight
end run