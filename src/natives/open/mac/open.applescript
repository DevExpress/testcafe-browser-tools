on run (argv)
	tell application "Safari"
		make new document with properties {URL:item 1 of argv}
		activate
	end tell
end run