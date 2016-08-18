using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Text;

namespace BrowserTools {
    class Maximize {
        //Consts
        const int SW_SHOWMAXIMIZED = 3;

        //Imports
        [DllImport("user32.dll")]
        static extern bool IsZoomed (IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool ShowWindow (IntPtr hWnd, int nCmdShow);

        //Methods
        static void MaximizeWindow (IntPtr hWnd) {
            using (new ForegroundWindowGuard())
                ShowWindow(hWnd, SW_SHOWMAXIMIZED);
        }

        static void CheckIsWindowMaximized (IntPtr hWnd) {
            Console.Out.WriteLine(IsZoomed(hWnd));
        }

        static void Main (string[] args) {
            if (args.Length == 0 || args.Length > 2) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            IntPtr hWnd = (IntPtr)int.Parse(args[0]);

            bool isStatusQuery = false;

            if (args.Length == 2) {
                if (args[1] == "status")
                    isStatusQuery = true;
                else {
                    Console.Error.Write("Incorrect arguments");
                    Environment.Exit(1);
                }
            }

            if (isStatusQuery)
                CheckIsWindowMaximized(hWnd);
            else
                MaximizeWindow(hWnd);
        }
    }
}
