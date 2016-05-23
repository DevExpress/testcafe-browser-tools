using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.Threading;
using System.Text;

namespace ResizeWindow {
    class Program {
        const int GW_CHILD = 5;
        const int GW_HWNDNEXT = 2;

        const int SW_SHOWMAXIMIZED = 3,
                  SW_SHOW = 5,
                  SW_RESTORE = 9;

        const uint SWP_SHOWWINDOW = 0x0040, 
                   SWP_NOCOPYBITS = 0x0100, 
                   SWP_NOSENDCHANGING = 0x0400;

        [StructLayout(LayoutKind.Sequential)]
        public struct WindowInfo
        {
            public uint cbSize;
            public Rect rcWindow;
            public Rect rcClient;
            public uint dwStyle;
            public uint dwExStyle;
            public uint dwWindowStatus;
            public uint cxWindowBorders;
            public uint cyWindowBorders;
            public ushort atomWindowType;
            public ushort wCreatorVersion;

            public WindowInfo(Boolean? filler)
                : this()   // Allows automatic initialization of "cbSize" with "new WINDOWINFO(null/true/false)".
            {
                cbSize = (UInt32)(Marshal.SizeOf(typeof(WindowInfo)));
            }

        }

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr GetWindowInfo(IntPtr hWnd, ref WindowInfo pwi);

        [DllImport("user32.dll")]
        private static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int width, int height, uint uFlags);

        [StructLayout(LayoutKind.Sequential)]
        public struct Rect {
            public int left;
            public int top;
            public int right;
            public int bottom;
        }

        [DllImport("user32.dll")]
        private static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        static extern uint GetWindowThreadProcessId(IntPtr hWnd, IntPtr ProcessId);

        [DllImport("kernel32.dll")]
        static extern uint GetCurrentThreadId();

        [DllImport("user32.dll")]
        static extern bool AttachThreadInput(uint idAttach, uint idAttachTo,
           bool fAttach);

        [DllImport("user32.dll", SetLastError = true)]
        static extern bool BringWindowToTop(IntPtr hWnd);

        [DllImport("user32.dll")]
        static extern bool IsZoomed(IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool SetForegroundWindow(IntPtr hWnd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

        static void RestoreDownWindow (IntPtr hWnd){
            IntPtr savedForegroundWindow = GetForegroundWindow();

            ShowWindow(hWnd, SW_RESTORE);

            if (GetForegroundWindow() != savedForegroundWindow)
                ForceForegroundWindow(savedForegroundWindow);
        }

        static void ResizeWindow(IntPtr hWnd, int width, int height)
        {
            WindowInfo wi = new WindowInfo();
            GetWindowInfo(hWnd, ref wi);

            SetWindowPos(hWnd, IntPtr.Zero,
                wi.rcWindow.left,
                wi.rcWindow.top,
                width,
                height,
                SWP_NOCOPYBITS | SWP_NOSENDCHANGING | SWP_SHOWWINDOW
            );
        }

        private static void ForceForegroundWindow(IntPtr hWnd)
        {
            uint foreThread = GetWindowThreadProcessId(GetForegroundWindow(), IntPtr.Zero);
            uint appThread = GetCurrentThreadId();
            bool threadAccessRequired = foreThread != appThread;

            if(threadAccessRequired)
                AttachThreadInput(foreThread, appThread, true);

            BringWindowToTop(hWnd);

            ShowWindow(hWnd, IsZoomed(hWnd) ? SW_SHOWMAXIMIZED : SW_SHOW);

            if(threadAccessRequired)
                AttachThreadInput(foreThread, appThread, false);
        }

        static void Main(string[] args) {
            if(args.Length != 3) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(-1);
            }

            IntPtr hWnd = (IntPtr)int.Parse(args[0]);

            int width  = Convert.ToInt32(args[1]),
                height = Convert.ToInt32(args[2]);

            // NOTE: If the target window is maximized, we should restore it before resizing.
            // Otherwise, the WS_MAXIMIZED style will still be applied to the window, which will result
            // in a wrong icon displayed in the header and buggy behavior in certain cases.
            if (IsZoomed(hWnd))
                RestoreDownWindow(hWnd);

            ResizeWindow(hWnd, width, height);
        }
    }
}
