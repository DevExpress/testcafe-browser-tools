using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

namespace BrowserTools {
    class Close {
        //Const
        const UInt32 WM_CLOSE = 0x10;

        //Imports
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        static extern IntPtr PostMessage (IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam);

        //Methods
        static void CloseWindow (IntPtr hWnd) {
            PostMessage(hWnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);
        }

        static void Main (string[] args) {
            if(args.Length != 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            string hWndStr = args[0];

            CloseWindow((IntPtr)int.Parse(hWndStr));
        }
    }
}
