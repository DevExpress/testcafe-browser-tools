using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;

namespace CloseWindow {
    class Program {
        //Const
        const UInt32 WM_CLOSE = 0x10;

        //Exports
        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        static extern IntPtr PostMessage(IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam);

        static void CloseWindow(IntPtr hwnd) {
            PostMessage(hwnd, WM_CLOSE, IntPtr.Zero, IntPtr.Zero);

            Environment.Exit(0);
        }

        static void Main(string[] args) {
            if(args.Length > 0) {
                string hwndStr = args[0];

                CloseWindow((IntPtr)int.Parse(hwndStr));
            }
            else {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }
        }
    }
}
