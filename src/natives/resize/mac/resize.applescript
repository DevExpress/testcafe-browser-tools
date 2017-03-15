on run (argv)
	if (count of argv) is not equal to 4 then
		error "Incorrect arguments"
	end if
	
	set windowId to (item 1 of argv as integer)
	set bundleId to (item 2 of argv as string)
	set newWidth to (item 3 of argv as integer)
	set newHeight to (item 4 of argv as integer)
	
	tell application id bundleId to set oldWindowBounds to bounds of window id windowId
	
	set {newX, newY} to oldWindowBounds
	
	tell application id bundleId
		set bounds of window id windowId to {newX, newY, newX + newWidth, newY + newHeight}
	end tell
end run