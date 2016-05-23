using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.IO;
using System.Diagnostics;
using System.Threading;

namespace FindWindow {
    class Program {
        //Const
        const UInt32 SMTO_ABORTIFHUNG = 0x0002;
        const UInt32 WM_GETTEXT = 0x0D;
        const UInt32 WM_GETTEXTLENGTH = 0x000E;

        const string IE_MAIN_WINDOW_CLASS_NAME = "IEFrame";
        // NOTE: Buffer size is "IEFrame".Length + 1
        const int CLASS_NAME_BUFFER_SIZE = 8;

        //Imports
        [DllImport("user32")]
        private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true)]
        static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(IntPtr hWnd, UInt32 Msg, IntPtr wParam, StringBuilder lParam, UInt32 fuFlags, UInt32 uTimeout, IntPtr lpdwResult);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam, UInt32 fuFlags, UInt32 uTimeout, out long lpdwResult);

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        static extern int GetClassName(IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);


        //Fields
        private delegate bool EnumWindowsProc(IntPtr windowHandle, IntPtr lParam);

        private static string windowMark = null;

        private static string GetWindowTitle(IntPtr hwnd) {
            long titleLength = 0;

            SendMessageTimeout(hwnd, WM_GETTEXTLENGTH, IntPtr.Zero, IntPtr.Zero, SMTO_ABORTIFHUNG, (UInt32)1000, out titleLength);

            if(titleLength > 0) {
                StringBuilder titleBuilder = new StringBuilder((int)titleLength + 1);
                SendMessageTimeout(hwnd, WM_GETTEXT, (IntPtr)titleBuilder.Capacity, titleBuilder, SMTO_ABORTIFHUNG, (UInt32)1000, IntPtr.Zero);
                return titleBuilder.ToString();
            } else
                return "";
        }

        private static string GetClassName(IntPtr hwnd) {
            StringBuilder className = new StringBuilder(CLASS_NAME_BUFFER_SIZE);

            int classNameLength = GetClassName(hwnd, className, className.Capacity);

            return classNameLength > 0 ? className.ToString() : "";
        }

        private static bool IsIEMainWindow(IntPtr hwnd) {
            return GetClassName(hwnd).Equals(IE_MAIN_WINDOW_CLASS_NAME);
        }

        private static bool EnumWindowsCallback(IntPtr hwnd, IntPtr lParam) {
            string title = GetWindowTitle(hwnd).ToLower();

            if(title.Contains(windowMark.ToLower())) {
                uint processID = 0;
                GetWindowThreadProcessId(hwnd, out processID);

                string processName = Process.GetProcessById((int)processID).ProcessName.ToLower();

                // NOTE: IE has two windows with the same title. We are searching for the main window by its class name.
                if(processName == "iexplore" && !IsIEMainWindow(hwnd)) {
                    return true;
                }

                Console.Out.WriteLine(hwnd);
                Console.Out.WriteLine(processName);
                Environment.Exit(0);

                return false;
            }

            return true;
        }

        static void Main(string[] args) {
            if(args.Length < 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            windowMark = args[0];

            // NOTE: Repeat the attempt to find the window ten times with 300ms delay
            for(int i = 0; i < 10; i++) {
                EnumWindows(EnumWindowsCallback, IntPtr.Zero);
                Thread.Sleep(300);
            }

            Console.Error.Write("Window not found");
            Environment.Exit(1);
        }
    }
}
