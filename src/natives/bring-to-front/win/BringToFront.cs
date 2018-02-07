using System;
using System.Runtime.InteropServices;

namespace BrowserTools {
    class BringToFront {
        //Imports
        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool SetForegroundWindow(IntPtr hWnd);

        //Methods
        static void BringWindowToFront(IntPtr hWnd) {
            SetForegroundWindow(hWnd);
        }

        static void Main(string[] args) {
            if(args.Length != 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            string hWndStr = args[0];

            BringWindowToFront((IntPtr)int.Parse(hWndStr));
        }
    }
}
