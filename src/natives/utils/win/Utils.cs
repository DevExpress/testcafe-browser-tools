using System;
using System.Collections.Generic;
using System.Text;
using System.Runtime.InteropServices;
using System.Threading;

namespace BrowserTools {
    //Win32 Type Definitions
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

        // NOTE: Allows automatic initialization of "cbSize" with "new WindowInfo(null/true/false)".
        public WindowInfo (Boolean? filler): this() {
            cbSize = (UInt32)(Marshal.SizeOf(typeof(WindowInfo)));
        }
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct WindowPos {
        public IntPtr hwnd;
        public IntPtr hwndInsertAfter;
        public int x;
        public int y;
        public int cx;
        public int cy;
        public uint flags;
    }

    [ComImport, InterfaceType(ComInterfaceType.InterfaceIsIUnknown), Guid("a5cd92ff-29be-454c-8d04-d82879fb3f1b")]
    [System.Security.SuppressUnmanagedCodeSecurity]
    interface IVirtualDesktopManager {
        [PreserveSig]
        int IsWindowOnCurrentVirtualDesktop ([In] IntPtr TopLevelWindow, [Out] out int OnCurrentDesktop);

        [PreserveSig]
        int GetWindowDesktopId ([In] IntPtr TopLevelWindow, [Out] out Guid CurrentDesktop);

        [PreserveSig]
        int MoveWindowToDesktop (
            [In] IntPtr TopLevelWindow,
            [MarshalAs(UnmanagedType.LPStruct)]
            [In]Guid CurrentDesktop
        );
    }

    [ComImport, Guid("aa509086-5ca9-4c25-8f95-589d3c07b48a")]
    class CVirtualDesktopManager {

    }

    class VirtualDesktopManager {
        public VirtualDesktopManager () {
            try {
                // NOTE: the code below will throw an COMException on the OSes older than Windows 10
                cmanager = new CVirtualDesktopManager();
                manager  = (IVirtualDesktopManager)cmanager;
            }
            catch (COMException) {
                manager  = null;
                cmanager = null;
            }
        }

        ~VirtualDesktopManager () {
            manager  = null;
            cmanager = null;
        }

        private CVirtualDesktopManager cmanager = null;
        private IVirtualDesktopManager manager;

        public bool IsWindowOnCurrentVirtualDesktop (IntPtr TopLevelWindow) {
            if (manager == null)
                return true;

            int result;
            int hresult = manager.IsWindowOnCurrentVirtualDesktop(TopLevelWindow, out result);

            return result != 0 && hresult == 0;
        }
    }

    //Helper Classes
    public class Utils
    {
        //Consts
        const string TASKBAR_CLASS_NAME = "Shell_TrayWnd";
        const string START_BUTTON_CLASS = "Button";
        const string START_BUTTON_TITLE = "Start";

        const uint SEND_MESSAGE_TIMEOUT       = 1000;
        const int  FOREGROUNDING_WINDOW_DELAY = 100;

        const int CLASSNAME_BUFFER_SIZE = 256;

        const uint GW_HWNDNEXT = 2;

        const uint SWP_NOSIZE = 0x0001;
        const uint SWP_NOMOVE = 0x0002;

        const uint SMTO_ABORTIFHUNG = 0x0002;

        const uint WM_GETTEXT       = 0x0D;
        const uint WM_GETTEXTLENGTH = 0x0E;

        static readonly IntPtr HWND_TOPMOST   = (IntPtr)(-1);
        static readonly IntPtr HWND_NOTOPMOST = (IntPtr)(-2);
        static readonly IntPtr HWND_BOTTOM    = (IntPtr) 1;

        //Imports
        [DllImport("user32.dll")]
        static extern IntPtr GetWindowRect (IntPtr hWnd, out Rect rect);

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr GetWindowInfo (IntPtr hWnd, out WindowInfo pwi);

        [DllImport("user32.dll")]
        static extern bool SetWindowPos (IntPtr hWnd, IntPtr hWndInsertAfter, int x, int y, int width, int height, uint uFlags);

        [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Auto)]
        static extern int GetClassName (IntPtr hWnd, StringBuilder lpClassName, int nMaxCount);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout (IntPtr hWnd, UInt32 Msg, IntPtr wParam, StringBuilder lParam, UInt32 fuFlags, UInt32 uTimeout, IntPtr lpdwResult);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        public static extern IntPtr SendMessageTimeout (IntPtr hWnd, UInt32 Msg, IntPtr wParam, IntPtr lParam, UInt32 fuFlags, UInt32 uTimeout, out long lpdwResult);

        [DllImport("user32.dll")]
        static extern IntPtr GetTopWindow (IntPtr hWnd = default(IntPtr));

        [DllImport("user32.dll", SetLastError = true)]
        static extern IntPtr GetWindow (IntPtr hWnd, uint uCmd);

        [DllImport("user32.dll")]
        [return: MarshalAs(UnmanagedType.Bool)]
        static extern bool IsWindowVisible (IntPtr hWnd);

        [DllImport("user32.dll", SetLastError = true)]
        static extern bool SetForegroundWindow(IntPtr hWnd);

        //Methods
        static bool HasZeroWindowRect (IntPtr hWnd) {
            Rect windowRect = GetWindowRect(hWnd);

            return windowRect.right - windowRect.left == 0 && windowRect.bottom - windowRect.top == 0;
        }

        static bool IsTaskBar (IntPtr hWnd) {
            return GetClassName(hWnd) == TASKBAR_CLASS_NAME;
        }

        static bool IsStartButton (IntPtr hWnd) {
            return GetClassName(hWnd) == START_BUTTON_CLASS && GetWindowTitle(hWnd) == START_BUTTON_TITLE;
        }

        public static string GetWindowTitle (IntPtr hWnd) {
            long titleLength = 0;

            SendMessageTimeout(
                hWnd,
                WM_GETTEXTLENGTH,
                IntPtr.Zero,
                IntPtr.Zero,
                SMTO_ABORTIFHUNG,
                SEND_MESSAGE_TIMEOUT,
                out titleLength
            );

            if (titleLength <= 0)
                return "";

            StringBuilder titleBuilder = new StringBuilder((int)titleLength + 1);

            SendMessageTimeout(
                hWnd,
                WM_GETTEXT,
                (IntPtr)titleBuilder.Capacity,
                titleBuilder,
                SMTO_ABORTIFHUNG,
                SEND_MESSAGE_TIMEOUT,
                IntPtr.Zero
            );

            return titleBuilder.ToString();
        }

        public static Rect GetWindowRect (IntPtr hWnd) {
            Rect windowRect;

            GetWindowRect(hWnd, out windowRect);

            return windowRect;
        }

        public static WindowInfo GetWindowInfo (IntPtr hWnd) {
            WindowInfo windowInfo;

            GetWindowInfo(hWnd, out windowInfo);

            return windowInfo;
        }

        public static string GetClassName (IntPtr hWnd) {
            StringBuilder actualClassName = new StringBuilder(CLASSNAME_BUFFER_SIZE);

            GetClassName(hWnd, actualClassName, actualClassName.Capacity);

            return actualClassName.ToString();
        }

        public static IntPtr GetForegroundWindow () {
            IntPtr win = GetTopWindow();

            while(win != IntPtr.Zero) {
                if (IsWindowVisible(win) && !IsTaskBar(win) && !IsStartButton(win) && !HasZeroWindowRect(win))
                    return win;

                win = GetWindow(win, GW_HWNDNEXT);
            }

            return IntPtr.Zero;
        }

        public static void ForceForegroundWindow (IntPtr hWnd) {
            SetWindowPos(hWnd, HWND_BOTTOM, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
            SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);
            SetWindowPos(hWnd, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE);

            SetForegroundWindow(hWnd);

            System.Threading.Thread.Sleep(FOREGROUNDING_WINDOW_DELAY);
        }

        public static bool IsWindowOnCurrentVirtualDesktop (IntPtr hWnd) {
            VirtualDesktopManager manager = new VirtualDesktopManager();

            return manager.IsWindowOnCurrentVirtualDesktop(hWnd);
        }
    }

    public class ForegroundWindowGuard : IDisposable {
        const string mutexId = "d9876c2d-c05d-490e-990e-6db370cca418";

        IntPtr savedForegroundWindow;

        static Mutex foregroundMutex = new Mutex(false, mutexId);


        public IntPtr ForegroundWindow {
            get {
                return savedForegroundWindow;
            }
        }

        public ForegroundWindowGuard () {
            foregroundMutex.WaitOne();
            savedForegroundWindow = Utils.GetForegroundWindow();
        }

        public void Dispose () {
            if(savedForegroundWindow != Utils.GetForegroundWindow())
                Utils.ForceForegroundWindow(savedForegroundWindow);

            foregroundMutex.ReleaseMutex();
        }
    }

    public enum EXIT_CODES: int {
        SUCCESS = 0,
        GENERAL_ERROR = 101,
        PERMISSION_ERROR = 102,
        WINDOW_NOT_FOUND = 103
    }
}
