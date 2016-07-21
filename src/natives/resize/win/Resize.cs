using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Text;

namespace BrowserNatives {
    class Resize {
        //Consts
        const int  SW_RESTORE = 9;

        const uint SWP_SHOWWINDOW     = 0x0040;
        const uint SWP_NOCOPYBITS     = 0x0100;
        const uint SWP_NOSENDCHANGING = 0x0400;
        const uint SWP_NOACTIVATE     = 0x0010;

        //Imports
        [DllImport("user32.dll")]
        private static extern bool SetWindowPos (IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int width, int height, uint uFlags);

        [DllImport("user32.dll")]
        static extern bool IsZoomed (IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool ShowWindow (IntPtr hWnd, int nCmdShow);

        //Methods
        static void RestoreDownWindow (IntPtr hWnd) {
            ShowWindow(hWnd, SW_RESTORE);
        }

        static void ResizeWindow (IntPtr hWnd, int width, int height) {
            WindowInfo wi = Utils.GetWindowInfo(hWnd);

            SetWindowPos(
                hWnd, 
                IntPtr.Zero,
                wi.rcWindow.left,
                wi.rcWindow.top,
                width,
                height,
                SWP_NOCOPYBITS | SWP_NOSENDCHANGING | SWP_SHOWWINDOW | SWP_NOACTIVATE
            );
        }

        static void Main (string[] args) {
            if(args.Length != 3) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(-1);
            }

            IntPtr hWnd = (IntPtr)int.Parse(args[0]);

            int width  = Convert.ToInt32(args[1]);
            int height = Convert.ToInt32(args[2]);

            using (new ForegroundWindowGuard()) {
                // NOTE: If the target window is maximized, we should restore it before resizing.
                // Otherwise, the WS_MAXIMIZED style will still be applied to the window, which will result
                // in a wrong icon displayed in the header and buggy behavior in certain cases.
                if (IsZoomed(hWnd))
                    RestoreDownWindow(hWnd);

                ResizeWindow(hWnd, width, height);
            }
        }
    }
}
