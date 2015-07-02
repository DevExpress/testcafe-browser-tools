using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace ShotWindow {
    class Program {
        //Consts
        const int GW_CHILD = 5;
        const int GW_HWNDNEXT = 2;

        //Exports
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
                : this()   // Allows automatic initialization of "cbSize" with "new WINDOWINFO(null/true/false)".
            {
                cbSize = (UInt32)(Marshal.SizeOf(typeof(WindowInfo)));
            }



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
                // Window client area has border
                wi.rcClient.top += 1;      // For client area in FireFox v28 and lower this border is absent.
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

        static Bitmap ShotWindow(IntPtr hwnd, WindowInfo wi, string browser) {
            // Copy browser window
            Bitmap windowBitmap = new Bitmap(wi.rcWindow.right - wi.rcWindow.left, wi.rcWindow.bottom - wi.rcWindow.top, System.Drawing.Imaging.PixelFormat.Format32bppRgb);
            Graphics graphicsWindow = Graphics.FromImage(windowBitmap);
            IntPtr hdc = graphicsWindow.GetHdc();

            PrintWindow(hwnd, hdc, 0);

            if(browser == "ie") // HACK for IE
                PrintWindow(hwnd, hdc, 0);

            graphicsWindow.ReleaseHdc(hdc);
            graphicsWindow.Flush();

            // Copy browser client area
            Bitmap clientAreaBitmap = windowBitmap.Clone(new Rectangle(
                new Point(wi.rcClient.left - wi.rcWindow.left, wi.rcClient.top - wi.rcWindow.top),
                new Size(wi.rcClient.right - wi.rcClient.left, wi.rcClient.bottom - wi.rcClient.top)), PixelFormat.Format32bppRgb);

            if(clientAreaBitmap.Size.Height == 1 && clientAreaBitmap.Size.Width == 1) {
                Console.Error.Write("Can't find the browser window");
                Environment.Exit(1);
            }

            return clientAreaBitmap;

        }

        static void SaveBitmap(Bitmap bmp, string folderPath, string fileName) {
            try {
                if(!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);
            }
            catch(Exception e) {
                Console.Error.Write(e.Message);
                Environment.Exit(1);
            }

            try {
                bmp.Save(folderPath + @"\" + fileName);
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
            string browser = args[1];   //"chrome" || "ie" || "firefox" || "opera"
            string folderPath = args[2];   //Path to screenshots folder
            string fileName = args[3];   //Screenshot file name
            
            WindowInfo windowInfo = GetWindowInfo(hwnd, browser);
            Bitmap screenshot = ShotWindow(hwnd, windowInfo, browser);
            SaveBitmap(screenshot, folderPath, fileName);

            if(createThumbnail) {
                string thumbnailFolderPath = args[4];
                int thumbnailWidth = Convert.ToInt32(args[5]);
                int thumbnailHeight = Convert.ToInt32(args[6]);

                Bitmap thumbnail = ResizeBitmap(screenshot, thumbnailWidth, thumbnailHeight);
                SaveBitmap(thumbnail, thumbnailFolderPath, fileName);
            }
        }
    }
}
