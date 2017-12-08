using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;
using System.Threading;
using System.Linq;

namespace BrowserTools {
    class Screenshot {
        //Consts
        const int GW_CHILD = 5;
        const int GW_HWNDNEXT = 2;
        const int SW_FORCEMINIMIZE = 11;
        const int SW_RESTORE = 9;

        const int MINIMIZE_MAXIMIZE_DELAY = 20;
        const int BRING_TO_FOREGROUND_DELAY = 500;

        //Imports
        [DllImport("user32.dll")]
        static extern bool IsZoomed (IntPtr hWnd);

        [DllImport("user32.dll", SetLastError = true)]
        internal static extern bool MoveWindow (IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

        [DllImport("user32.dll")]
        private static extern bool PrintWindow (IntPtr hWnd, IntPtr hdcBlt, uint nFlags);

        public delegate bool EnumWindowsProc (IntPtr hwnd, IntPtr lParam);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        public static extern bool EnumChildWindows (IntPtr hwndParent, EnumWindowsProc lpEnumFunc, IntPtr lParam = default(IntPtr));

        struct WindowBorderOnScreenFlags {
            public bool leftBorderOnScreen;
            public bool rightBorderOnScreen;
            public bool topBorderOnScreen;
            public bool bottomBorderOnScreen;

            public WindowBorderOnScreenFlags (WindowInfo wi, Screen s) {
                leftBorderOnScreen   = (wi.rcWindow.left >= s.WorkingArea.Left) && (wi.rcWindow.left < s.WorkingArea.Right);
                rightBorderOnScreen  = (wi.rcWindow.right > s.WorkingArea.Left) && (wi.rcWindow.right <= s.WorkingArea.Right);
                topBorderOnScreen    = (wi.rcWindow.top >= s.WorkingArea.Top) && (wi.rcWindow.top < s.WorkingArea.Bottom);
                bottomBorderOnScreen = (wi.rcWindow.bottom > s.WorkingArea.Top) && (wi.rcWindow.bottom <= s.WorkingArea.Bottom);
            }
        }

        static bool isWindows10 () {
            string currentVersionKey = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion";
            int majorVersion = (int)Microsoft.Win32.Registry.GetValue(currentVersionKey, "CurrentMajorVersionNumber", 0);

            return majorVersion == 10;
        }

        static bool isMSEdgeBrowser (string processName) {
            // NOTE: Edge is a Universal Windows App and it is managed by the "applicationframehost" process.
            return processName == "applicationframehost";
        }

        static int GetWindowVisibleArea (WindowInfo wi, Screen s) {
            WindowBorderOnScreenFlags flags = new WindowBorderOnScreenFlags(wi, s);

            int visibleWidth  = 0;
            int visibleHeight = 0;

            if (flags.leftBorderOnScreen)
                visibleWidth = flags.rightBorderOnScreen ? wi.rcWindow.right - wi.rcWindow.left : s.WorkingArea.Right - wi.rcWindow.left;
            else if (flags.rightBorderOnScreen)
                visibleWidth = wi.rcWindow.right - s.WorkingArea.Left;

            if (flags.topBorderOnScreen)
                visibleHeight = flags.bottomBorderOnScreen ? wi.rcWindow.bottom - wi.rcWindow.top : s.WorkingArea.Bottom - wi.rcWindow.top;
            else if (flags.bottomBorderOnScreen)
                visibleHeight = wi.rcWindow.bottom - s.WorkingArea.Top;

            return visibleWidth * visibleHeight;
        }

        static Rectangle GetVisibleRectangle (WindowInfo wi, Screen s) {
            Rectangle resultWindowRect = new Rectangle(
                wi.rcWindow.left,
                wi.rcWindow.top,
                wi.rcWindow.right - wi.rcWindow.left,
                wi.rcWindow.bottom - wi.rcWindow.top
            );

            WindowBorderOnScreenFlags flags = new WindowBorderOnScreenFlags(wi, s);

            if (!flags.leftBorderOnScreen)
                resultWindowRect.X = s.WorkingArea.X;
            else {
                resultWindowRect.X = !flags.rightBorderOnScreen ?
                    s.WorkingArea.Right - wi.rcWindow.right + wi.rcWindow.left :
                    wi.rcWindow.left;
            }

            if (!flags.topBorderOnScreen)
                resultWindowRect.Y = s.WorkingArea.Y;
            else {
                resultWindowRect.Y = !flags.bottomBorderOnScreen ?
                    s.WorkingArea.Bottom - wi.rcWindow.bottom + wi.rcWindow.top :
                    wi.rcWindow.top;
            }

            return resultWindowRect;
        }

        static string GetChildWindowName(string processName) {
            if (processName == "chrome" || processName == "opera")
                return "Chrome_RenderWidgetHostHWND";
            else if (processName == "iexplore")
                return "Internet Explorer_Server";
            else if (isMSEdgeBrowser(processName))
                return "ApplicationFrameInputSinkWindow";

            return "";
        }

        static WindowInfo GetWindowInfo (IntPtr hwnd, string processName) {
            WindowInfo wi = Utils.GetWindowInfo(hwnd);

            string childWindowName = GetChildWindowName(processName);

            if (!String.IsNullOrEmpty(childWindowName)) {
                EnumChildWindows(hwnd, (IntPtr childHWnd, IntPtr param) => {
                    if (Utils.GetClassName(childHWnd) != childWindowName)
                        return true;

                    wi.rcClient = Utils.GetWindowRect(childHWnd);
                    return false;
                });
            }

            if (wi.rcWindow.left < 0 && wi.rcWindow.right < 0 && wi.rcWindow.top < 0 && wi.rcWindow.bottom < 0) {
                Console.Error.Write("Window is not on the screen");
                Environment.Exit(1);
            }

            return wi;
        }

        static void PlaceWindowOnScreen (IntPtr hWnd) {
            if (IsZoomed(hWnd))
                return;

            WindowInfo wi = Utils.GetWindowInfo(hWnd);

            int maxVisibleArea = 0;

            Rectangle resultWindowRect = new Rectangle();

            bool found = false;

            foreach (var s in Screen.AllScreens) {
                int visibleArea = GetWindowVisibleArea(wi, s);

                if (visibleArea > maxVisibleArea) {
                    maxVisibleArea = visibleArea;

                    resultWindowRect = GetVisibleRectangle(wi, s);

                    found = true;
                }
            }

            if (found)
                MoveWindow(hWnd, resultWindowRect.X, resultWindowRect.Y, resultWindowRect.Width, resultWindowRect.Height, true);
        }

        static Bitmap CaptureFromScreen (IntPtr hwnd, WindowInfo wi) {
            using (var guard = new ForegroundWindowGuard()) {
                if (guard.ForegroundWindow != hwnd)
                    Utils.ForceForegroundWindow(hwnd);

                Bitmap windowBitmap = new Bitmap(
                    wi.rcWindow.right - wi.rcWindow.left,
                    wi.rcWindow.bottom - wi.rcWindow.top,
                    System.Drawing.Imaging.PixelFormat.Format32bppRgb
                );

                Graphics graphicsWindow = Graphics.FromImage(windowBitmap);

                graphicsWindow.CopyFromScreen(
                    new Point(wi.rcWindow.left, wi.rcWindow.top),
                    Point.Empty,
                    windowBitmap.Size,
                    CopyPixelOperation.SourceCopy
                );

                return windowBitmap;
            }
        }

        static Bitmap PrintWindow (IntPtr hwnd, WindowInfo wi, string processName) {
            Bitmap windowBitmap = new Bitmap(
                wi.rcWindow.right - wi.rcWindow.left,
                wi.rcWindow.bottom - wi.rcWindow.top,
                System.Drawing.Imaging.PixelFormat.Format32bppRgb
            );

            Graphics graphicsWindow = Graphics.FromImage(windowBitmap);
            IntPtr   hdc            = graphicsWindow.GetHdc();

            PrintWindow(hwnd, hdc, 0);

            if (processName == "iexplore") // HACK: for IE
                PrintWindow(hwnd, hdc, 0);

            graphicsWindow.ReleaseHdc(hdc);
            graphicsWindow.Flush();

            return windowBitmap;
        }

        static Bitmap CaptureWindow (IntPtr hwnd, string processName) {
            bool isCurrentDesktop = Utils.IsWindowOnCurrentVirtualDesktop(hwnd);

            // NOTE: We are capturing the screen area directly if the windows is on currently active virtual desktop,
            // so we must ensure that the entire window area fits the screen borders.
            if (isCurrentDesktop)
                PlaceWindowOnScreen(hwnd);

            WindowInfo wi = GetWindowInfo(hwnd, processName);

            Bitmap windowBitmap = isCurrentDesktop ?
                CaptureFromScreen(hwnd, wi) :
                PrintWindow(hwnd, wi, processName);

            Bitmap clientAreaBitmap = windowBitmap.Clone(
                new Rectangle(
                    new Point(wi.rcClient.left - wi.rcWindow.left, wi.rcClient.top - wi.rcWindow.top),
                    new Size(wi.rcClient.right - wi.rcClient.left, wi.rcClient.bottom - wi.rcClient.top)
                ),
                PixelFormat.Format32bppRgb
            );

            if (clientAreaBitmap.Size.Height == 1 && clientAreaBitmap.Size.Width == 1) {
                Console.Error.Write("Can't find the browser window");
                Environment.Exit(1);
            }

            return clientAreaBitmap;
        }

        static void SaveBitmap (Bitmap bmp, string filePath) {
            try {
                using (FileStream fs = new FileStream(filePath, FileMode.Create, FileAccess.ReadWrite))
                {
                    bmp.Save(fs, ImageFormat.Png);
                }
            }
            catch (Exception e) {
                Console.Error.Write(e.Message);
                Environment.Exit(1);
            }
        }

        static void Main (string[] args) {
            if (args.Length != 3) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            IntPtr hwnd = (IntPtr)Convert.ToInt32(args[0]);

            // NOTE: The process name can be "chrome" || "iexplore" (IE) || "firefox" || "opera" || "applicationframehost" (Edge)
            string processName    = args[1];
            string screenshotPath = args[2];

            Bitmap screenshot = CaptureWindow(hwnd, processName);

            SaveBitmap(screenshot, screenshotPath);
        }
    }
}
