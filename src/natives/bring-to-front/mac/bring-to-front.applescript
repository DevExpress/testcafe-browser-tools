on run (argv)
	if (count of argv) is not equal to 2 then
		error "Incorrect arguments"
	end if
	
	set windowId to (item 1 of argv as integer)
	set bundleId to (item 2 of argv as string)
	
	tell application id bundleId
		activate window windowId
	end tell
end run