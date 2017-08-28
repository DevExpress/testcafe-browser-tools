on run (argv)
	if (count of argv) is not equal to 1 then
		error "Incorrect arguments"
	end if
	set windowNamePart to item 1 of argv

	repeat 10 times
		try
			set {bundleId, windowId} to findAppByWindowTitle(windowNamePart)

			if bundleId is not equal to "" then
				return bundleId & linefeed & windowId
			end if
		end try

		#300ms delay
		delay 0.3
	end repeat

	error "Window not found"
end run

on findAppByWindowTitle(windowNamePart)
	tell application "System Events"
		set bundleIds to (get bundle identifier of every process whose background only is false)
	end tell

	repeat with bundleId in bundleIds

		tell application id bundleId
			set windowsNamesList to {}
			try
			    # HACK: Some apps (e.g. Sublime) fail AppleScript queries after the default 2 mins timeout
				with timeout 1 second
					set windowsNamesList to (get name of every window)
				end timeout
			end try
			repeat with windowName in windowsNamesList
				if (windowName as string) contains windowNamePart then
					set windowId to id of window windowName
					return {(bundleId as string), (windowId as string)}
				end if
			end repeat
		end tell

	end repeat

	return ""
end findAppByWindowTitle
