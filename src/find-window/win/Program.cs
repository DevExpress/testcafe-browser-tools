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

        //Imports
        [DllImport("user32")]
        private static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll")]
        private static extern bool EnumChildWindows(IntPtr hWndStart, EnumWindowsProc callback, IntPtr lParam);

        [DllImport("user32.dll", SetLastError = true)]
        static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(IntPtr hWnd, UInt32 Msg, IntPtr wParam, StringBuilder lParam, UInt32 fuFlags, UInt32 uTimeout, IntPtr lpdwResult);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout(IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam, UInt32 fuFlags, UInt32 uTimeout, out long lpdwResult);

        //Utils
        private struct IEWindow {
            public IntPtr hwnd;
            public string url;

            public IEWindow(IntPtr windowHwnd, string windowUrl) {
                hwnd = windowHwnd;
                url = windowUrl;
            }
        }

        //Fields
        private delegate bool EnumWindowsProc(IntPtr windowHandle, IntPtr lParam);

        static List<IEWindow> ieWindows = new List<IEWindow>();

        private static string windowMark = null;

        private static void FillIEWindows() {
            ieWindows.Clear();

            SHDocVw.ShellWindows shellWindows = new SHDocVw.ShellWindows();

            foreach(SHDocVw.WebBrowser ie in shellWindows) {
                if(Path.GetFileNameWithoutExtension(ie.FullName).ToLower().Equals("iexplore")) {
                    ieWindows.Add(new IEWindow((IntPtr)ie.HWND, ie.LocationURL.ToLower()));
                }
            }
        }

        private static IEWindow FindInIEWindows(IntPtr hwnd) {
            return ieWindows.Find(window => window.hwnd.Equals(hwnd) && window.url.Equals(windowMark.ToLower()));
        }

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

        private static bool EnumWindowsCallback(IntPtr hwnd, IntPtr lParam) {
            IEWindow ieWindow = FindInIEWindows(hwnd);

            if(ieWindow.url != null) {
                Console.Out.Write("{0} {1}", hwnd, "ie");
                Environment.Exit(0);

                return false;
            }

            string title = GetWindowTitle(hwnd).ToLower();

            if(title.Contains(windowMark.ToLower())) {
                uint processID = 0;
                GetWindowThreadProcessId(hwnd, out processID);

                string processName = Process.GetProcessById((int)processID).ProcessName.ToLower(); ;

                Console.Out.Write("{0} {1}", hwnd, processName);
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

            // NOTE: in IE, we search for a window by the page URL, while in other browsers, we do this by the window
            // title. So, if you need to find a window in a non-IE browser, put the page URL to the window title before
            // running this.
            windowMark = args[0];


            //NOTE: Repeat attempt to find window 10 times with 300ms delay
            for(int i = 0; i < 10; i++) {
                FillIEWindows();
                EnumWindows(EnumWindowsCallback, IntPtr.Zero);
                Thread.Sleep(300);
            }

            Console.Error.Write("Window not found");
            Environment.Exit(1);
        }
    }
}