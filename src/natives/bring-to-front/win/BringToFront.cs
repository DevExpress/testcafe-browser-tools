using System;
using System.Runtime.InteropServices;

namespace BrowserTools {
    class BringToFront {
        //Methods
        static void Main(string[] args) {
            if(args.Length != 1) {
                Console.Error.Write("Incorrect arguments");
                Environment.Exit(1);
            }

            Utils.ForceForegroundWindow((IntPtr)int.Parse(args[0]));
        }
    }
}
