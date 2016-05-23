using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;
using System.Threading;

namespace GetWindowSize {
    class Program {
        //Imports

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr GetWindowInfo(IntPtr hWnd, ref WindowInfo pwi);

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

        static void Main(string[] args) {
            if(args.Length < 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            IntPtr hwnd = (IntPtr)Convert.ToInt32(args[0]);

            WindowInfo wi = new WindowInfo();
            GetWindowInfo(hwnd, ref wi);

            Console.Out.WriteLine(wi.rcWindow.right - wi.rcWindow.left);
            Console.Out.WriteLine(wi.rcWindow.bottom - wi.rcWindow.top);
        }
    }
}
