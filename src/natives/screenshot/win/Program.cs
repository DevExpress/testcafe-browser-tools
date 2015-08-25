using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;
using System.Threading;

namespace Screenshot {
    class Program {
        //Consts
        const int GW_CHILD = 5;
        const int GW_HWNDNEXT = 2;
        const int SW_FORCEMINIMIZE = 11;
        const int SW_RESTORE = 9;

        const int MINIMIZE_MAXIMIZE_DELAY = 20;
        const int BRING_TO_FOREGROUND_DELAY = 500;

        //Imports
        [DllImport("user32.dll")]
        static extern bool IsZoomed(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern IntPtr GetForegroundWindow();

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool ShowWindowAsync(IntPtr hWnd, uint nCmdShow);

        [DllImport("user32.dll", SetLastError = true)]
        internal static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr GetWindowInfo(IntPtr hWnd, ref WindowInfo pwi);

        [DllImport("user32.dll", CharSet = CharSet.Auto)]
        public static extern IntPtr FindWindowEx(IntPtr parent /*HWND*/, IntPtr next /*HWND*/, string sClassName, IntPtr sWindowTitle);

        [DllImport("user32.dll")]
        public static extern IntPtr GetWindowRect(IntPtr hWnd, ref Rect rect);

        [DllImport("user32.dll", ExactSpelling = true, CharSet = CharSet.Auto)]
        public static extern IntPtr GetWindow(IntPtr hWnd, int uCmd);

        [DllImport("user32.Dll")]
        public static extern void GetClassName(int h, StringBuilder s, int nMaxCount);

        [DllImport("user32.dll")]
        private static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);

        [StructLayout(LayoutKind.Sequential)]
        public struct Rect {
            public int left;
            public int top;
            public int right;
            public int bottom;
        }

        [StructLayout(LayoutKind.Sequential)]
        public struct WindowInfo {
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
                : this()   // NOTE: Allows automatic initialization of "cbSize" with "new WINDOWINFO(null/true/false)".
            {
                cbSize = (UInt32)(Marshal.SizeOf(typeof(WindowInfo)));
            }
        }

        struct WindowBorderOnScreenFlags {
            public bool leftBorderOnScreen;
            public bool rightBorderOnScreen;
            public bool topBorderOnScreen;
            public bool bottomBorderOnScreen;

            public WindowBorderOnScreenFlags(WindowInfo wi, Screen s) {
                leftBorderOnScreen = (wi.rcWindow.left >= s.WorkingArea.Left) && (wi.rcWindow.left < s.WorkingArea.Right);
                rightBorderOnScreen = (wi.rcWindow.right > s.WorkingArea.Left) && (wi.rcWindow.right <= s.WorkingArea.Right);
                topBorderOnScreen = (wi.rcWindow.top >= s.WorkingArea.Top) && (wi.rcWindow.top < s.WorkingArea.Bottom);
                bottomBorderOnScreen = (wi.rcWindow.bottom > s.WorkingArea.Top) && (wi.rcWindow.bottom <= s.WorkingArea.Bottom);
            }
        }

        static bool isMSEdgeBrowser(string browser){
            //NOTE: Edge is an Universal Windows App and managed by process 'applicationframehost.exe'.
            return browser == "applicationframehost";
        }

        static int GetWindowVisibleArea(WindowInfo wi, Screen s) {
            WindowBorderOnScreenFlags flags = new WindowBorderOnScreenFlags(wi, s);

            int visibleWidth = 0,
                visibleHeight = 0;

            if(flags.leftBorderOnScreen)
                visibleWidth = flags.rightBorderOnScreen ? wi.rcWindow.right - wi.rcWindow.left : s.WorkingArea.Right - wi.rcWindow.left;
            else if(flags.rightBorderOnScreen)
                visibleWidth = wi.rcWindow.right - s.WorkingArea.Left;

            if(flags.topBorderOnScreen)
                visibleHeight = flags.bottomBorderOnScreen ? wi.rcWindow.bottom - wi.rcWindow.top : s.WorkingArea.Bottom - wi.rcWindow.top;
            else if(flags.bottomBorderOnScreen)
                visibleHeight = wi.rcWindow.bottom - s.WorkingArea.Top;

            return visibleWidth * visibleHeight;
        }

        static Rectangle GetVisibleRectangle(WindowInfo wi, Screen s) {
            Rectangle resultWindowRect = new Rectangle(
                wi.rcWindow.left,
                wi.rcWindow.top,
                wi.rcWindow.right - wi.rcWindow.left,
                wi.rcWindow.bottom - wi.rcWindow.top
            );

            WindowBorderOnScreenFlags flags = new WindowBorderOnScreenFlags(wi, s);

            if(!flags.leftBorderOnScreen)
                resultWindowRect.X = s.WorkingArea.X;
            else {
                resultWindowRect.X = !flags.rightBorderOnScreen ?
                    s.WorkingArea.Right - wi.rcWindow.right + wi.rcWindow.left :
                    wi.rcWindow.left;
            }

            if(!flags.topBorderOnScreen)
                resultWindowRect.Y = s.WorkingArea.Y;
            else {
                resultWindowRect.Y = !flags.bottomBorderOnScreen ?
                    s.WorkingArea.Bottom - wi.rcWindow.bottom + wi.rcWindow.top :
                    wi.rcWindow.top;
            }

            return resultWindowRect;
        }

        static WindowInfo GetWindowInfo(IntPtr hwnd, string browser) {
            WindowInfo wi = new WindowInfo();
            GetWindowInfo(hwnd, ref wi);

            if(browser == "chrome") {
                IntPtr hostHWND = FindWindowEx(hwnd, IntPtr.Zero, "Chrome_RenderWidgetHostHWND", IntPtr.Zero);

                if(hostHWND != IntPtr.Zero)
                    GetWindowRect(hostHWND, ref wi.rcClient);
            }
            else if(browser == "firefox") {
                // NOTE: Window client area has border
                wi.rcClient.top += 1;      // NOTE: For client area in FireFox v28 and lower this border is absent.
                wi.rcClient.left += 1;
                wi.rcClient.bottom -= 1;
                wi.rcClient.right -= 1;
            }
            else if(browser == "ie") {
                IntPtr hChildWnd = GetWindow(hwnd, GW_CHILD);
                StringBuilder sb = new StringBuilder(256);

                IntPtr tempHwnd = hwnd;

                while(tempHwnd != IntPtr.Zero) {
                    GetClassName(hwnd.ToInt32(), sb, 256);

                    if(sb.ToString().IndexOf("Shell DocObject View", 0) > -1) {
                        tempHwnd = FindWindowEx(tempHwnd, IntPtr.Zero, "Internet Explorer_Server", IntPtr.Zero);
                        break;
                    }
                    tempHwnd = GetWindow(tempHwnd, GW_HWNDNEXT);
                }

                GetWindowRect(tempHwnd, ref wi.rcClient);
            }

            if(wi.rcWindow.left < 0 && wi.rcWindow.right < 0 && wi.rcWindow.top < 0 && wi.rcWindow.bottom < 0) {
                Console.Error.Write("Window is not on the screen");
                Environment.Exit(1);
            }

            return wi;
        }

        static void PlaceWindowOnScreen(IntPtr hWnd) {
            WindowInfo wi = new WindowInfo();
            GetWindowInfo(hWnd, ref wi);

            int maxVisibleArea = 0;

            Rectangle resultWindowRect = new Rectangle();

            bool found = false;

            foreach(var s in Screen.AllScreens) {
                int visibleArea = GetWindowVisibleArea(wi, s);

                if(visibleArea > maxVisibleArea) {
                    maxVisibleArea = visibleArea;

                    resultWindowRect = GetVisibleRectangle(wi, s);

                    found = true;
                }
            }

            if(found)
                MoveWindow(hWnd, resultWindowRect.X, resultWindowRect.Y, resultWindowRect.Width, resultWindowRect.Height, true);
        }

        static void ForegroundWindow(IntPtr hwnd) {
            ShowWindowAsync(hwnd, SW_FORCEMINIMIZE);
            Thread.Sleep(MINIMIZE_MAXIMIZE_DELAY);
            ShowWindowAsync(hwnd, SW_RESTORE);
            Thread.Sleep(BRING_TO_FOREGROUND_DELAY);
        }

        static Bitmap CaptureFromScreen(IntPtr hwnd, WindowInfo wi) {
            IntPtr fgHwnd = GetForegroundWindow();

            if(fgHwnd != hwnd)
                ForegroundWindow(hwnd);

            Bitmap windowBitmap = new Bitmap(wi.rcWindow.right - wi.rcWindow.left, wi.rcWindow.bottom - wi.rcWindow.top, System.Drawing.Imaging.PixelFormat.Format32bppRgb);
            Graphics graphicsWindow = Graphics.FromImage(windowBitmap);

            graphicsWindow.CopyFromScreen(new Point(wi.rcWindow.left, wi.rcWindow.top), Point.Empty, windowBitmap.Size, CopyPixelOperation.SourceCopy);

            if(fgHwnd != hwnd)
                ForegroundWindow(fgHwnd);

            return windowBitmap;
        }

        static Bitmap PrintWindow(IntPtr hwnd, WindowInfo wi, string browser) {
            Bitmap windowBitmap = new Bitmap(wi.rcWindow.right - wi.rcWindow.left, wi.rcWindow.bottom - wi.rcWindow.top, System.Drawing.Imaging.PixelFormat.Format32bppRgb);
            Graphics graphicsWindow = Graphics.FromImage(windowBitmap);
            IntPtr hdc = graphicsWindow.GetHdc();

            PrintWindow(hwnd, hdc, 0);

            if(browser == "ie") // HACK: for IE
                PrintWindow(hwnd, hdc, 0);

            graphicsWindow.ReleaseHdc(hdc);
            graphicsWindow.Flush();

            return windowBitmap;
        }

        static Bitmap Screenshot(IntPtr hwnd, string browser) {
            //NOTE: We are capturing the screen area directly when taking a screenshot of Microsoft Edge,
            //so we must ensure that the entire window area fits the screen borders.
            if(isMSEdgeBrowser(browser))
                PlaceWindowOnScreen(hwnd);

            WindowInfo wi = GetWindowInfo(hwnd, browser);

            Bitmap windowBitmap = isMSEdgeBrowser(browser) ?
                CaptureFromScreen(hwnd, wi) :
                PrintWindow(hwnd, wi, browser);

            Bitmap clientAreaBitmap = windowBitmap.Clone(new Rectangle(
                new Point(wi.rcClient.left - wi.rcWindow.left, wi.rcClient.top - wi.rcWindow.top),
                new Size(wi.rcClient.right - wi.rcClient.left, wi.rcClient.bottom - wi.rcClient.top)), PixelFormat.Format32bppRgb);

            if(clientAreaBitmap.Size.Height == 1 && clientAreaBitmap.Size.Width == 1) {
                Console.Error.Write("Can't find the browser window");
                Environment.Exit(1);
            }

            return clientAreaBitmap;
        }

        static void SaveBitmap(Bitmap bmp, string dirPath, string fileName) {
            try {
                if(!Directory.Exists(dirPath))
                    Directory.CreateDirectory(dirPath);
            }
            catch(Exception e) {
                Console.Error.Write(e.Message);
                Environment.Exit(1);
            }

            try {
                bmp.Save(dirPath + @"\" + fileName);
            }
            catch(Exception e) {
                Console.Error.Write(e.Message);
                Environment.Exit(1);
            }
        }

        static Bitmap ResizeBitmap(Bitmap bmp, int width, int height) {
            Bitmap result = new Bitmap(width, height);

            using(var g = Graphics.FromImage(result)) {
                g.DrawImage((Bitmap)bmp.Clone(), 0, 0, width, height);
                g.Dispose();
            }

            return result;
        }

        static void Main(string[] args) {
            bool createThumbnail = args.Length >= 7;

            if(args.Length < 4) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            IntPtr hwnd = (IntPtr)Convert.ToInt32(args[0]);
            string browser = args[1];   //NOTE: "chrome" || "ie" || "firefox" || "opera"
            string dirPath = args[2];
            string fileName = args[3];

            Bitmap screenshot = Screenshot(hwnd, browser);
            SaveBitmap(screenshot, dirPath, fileName);

            if(createThumbnail) {
                string thumbnailDirPath = args[4];
                int thumbnailWidth = Convert.ToInt32(args[5]);
                int thumbnailHeight = Convert.ToInt32(args[6]);

                Bitmap thumbnail = ResizeBitmap(screenshot, thumbnailWidth, thumbnailHeight);
                SaveBitmap(thumbnail, thumbnailDirPath, fileName);
            }
        }
    }
}
