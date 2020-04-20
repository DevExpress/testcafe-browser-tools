using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.IO;
using System.Diagnostics;
using System.Threading;

namespace BrowserTools {
    class FindWindow {
        //Consts
        const string IE_MAIN_WINDOW_CLASS_NAME = "IEFrame";

        //Imports

        // NOTE: EnumWindow has an IntPtr argument that is passed to the EnumWindowProc callback.
        // We can pass a string directly through this argument but must ensure that it marshalled
        // as a Unicode LPWStr string and not marked as 'ref' or 'out' for optimal performance
        // See https://docs.microsoft.com/en-us/dotnet/standard/native-interop/best-practices#string-parameters
        private delegate bool EnumWindowsProc (
            IntPtr hWnd,
            [MarshalAs(UnmanagedType.LPWStr)] string windowMark
        );

        [DllImport("user32", CharSet = CharSet.Unicode, ExactSpelling = true)]
        private static extern bool EnumWindows (EnumWindowsProc lpEnumFunc, string windowMark);

        [DllImport("user32.dll", SetLastError = true)]
        static extern uint GetWindowThreadProcessId (IntPtr hWnd, out uint lpdwProcessId);

        //Methods
        private static bool IsIEMainWindow (IntPtr hWnd) {
            return Utils.GetClassName(hWnd) == IE_MAIN_WINDOW_CLASS_NAME;
        }

        private static bool CheckWindowTitle (IntPtr hWnd, string windowMark) {
            string title = Utils.GetWindowTitle(hWnd).ToLower();

            if (!title.Contains(windowMark.ToLower()))
                return true;

            uint processID = 0;

            GetWindowThreadProcessId(hWnd, out processID);

            string processName = Process.GetProcessById((int)processID).ProcessName.ToLower();

            // NOTE: IE has two windows with the same title. We are searching for the main window by its class name.
            if (processName == "iexplore" && !IsIEMainWindow(hWnd))
                return true;

            // NOTE: MS Edge has different process ("applicationframehost" and "microsoftedgecp") with windows with the same title.
            // "microsoftedgecp" is the wrong one.
            if (processName == "microsoftedgecp")
                return true;

            Console.Out.WriteLine(hWnd);
            Console.Out.WriteLine(processName);
            Environment.Exit((int)EXIT_CODES.SUCCESS);

            return false;
        }

        static void Main (string[] args) {
            if (args.Length != 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit((int)EXIT_CODES.GENERAL_ERROR);
            }

            string windowMark = args[0];

            // NOTE: Repeat the attempt to find the window ten times with 300ms delay
            for (int i = 0; i < 10; i++) {
                EnumWindows(CheckWindowTitle, windowMark);
                Thread.Sleep(300);
            }

            Console.Error.Write("Window not found");
            Environment.Exit((int)EXIT_CODES.WINDOW_NOT_FOUND);
        }
    }
}
