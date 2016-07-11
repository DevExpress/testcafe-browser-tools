using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Windows.Forms;
using System.Threading;

namespace BrowserNatives {
    class GetWindowSize {
        static void Main (string[] args) {
            if (args.Length != 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            IntPtr hwnd = (IntPtr)Convert.ToInt32(args[0]);

            WindowInfo wi = Utils.GetWindowInfo(hwnd);

            Console.Out.WriteLine(wi.rcWindow.right - wi.rcWindow.left);
            Console.Out.WriteLine(wi.rcWindow.bottom - wi.rcWindow.top);
        }
    }
}
