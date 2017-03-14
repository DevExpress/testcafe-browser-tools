on run (argv)
	set windowId to (item 1 of argv as integer)
	
	set bundleId to (item 2 of argv as string)
	
	tell application id bundleId to close window id windowId
end run