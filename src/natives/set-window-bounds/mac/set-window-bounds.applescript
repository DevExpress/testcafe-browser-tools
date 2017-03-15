on run (argv)
	if (count of argv) is not equal to 6 then
		error "Incorrect arguments"
	end if
	
	set windowId to (item 1 of argv as integer)
	set bundleId to (item 2 of argv as string)
	set newLeft to (item 3 of argv as integer)
	set newTop to (item 4 of argv as integer)
	set newRight to (item 5 of argv as integer)
	set newBottom to (item 6 of argv as integer)
	
	tell application id bundleId to set bounds of window id windowId to {newLeft, newTop, newRight, newBottom}
end run