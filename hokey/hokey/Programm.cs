using System;
using System.Diagnostics;
using System.Net;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

class Programm
{
	private const int WH_KEYBOARD_LL = 13;
	private const int WM_KEYDOWN = 0x0100;
	private static LowLevelKeyboardProc _proc = HookCallback;
	private static IntPtr _hookID = IntPtr.Zero;
	private static string hotKeyRaised="";
	private static int timeoutSeconds=60;

	private static EventWaitHandle hotKeyPressed = new EventWaitHandle(false, EventResetMode.AutoReset);

	static void Main(string[] args)
	{
		_hookID = SetHook(_proc);
		CreateListerner();
		Application.Run();
		UnhookWindowsHookEx(_hookID);
	}

	private static void CreateListerner()
	{
		var listener = new HttpListener();
		var prefix = "http://localhost:18711/hotkeys/";
		listener.Prefixes.Add(prefix);
		listener.Start();
		listener.BeginGetContext(ListenerCallback, listener);
	}

	private static void ListenerCallback(IAsyncResult result)
	{
		HttpListener listener = (HttpListener)result.AsyncState;
		HttpListenerContext context = listener.EndGetContext(result);
		HttpListenerRequest request = context.Request;
		HttpListenerResponse response = context.Response;

		var keyPressed = hotKeyPressed.WaitOne(new TimeSpan(0, 0, timeoutSeconds));

		string responseString;
		if (!string.IsNullOrEmpty(hotKeyRaised) && keyPressed)
		{
			responseString = hotKeyRaised;
			hotKeyRaised = "";
		}
		else
			responseString = "nothingHappened";

		byte[] buffer = System.Text.Encoding.UTF8.GetBytes(responseString);
		response.ContentLength64 = buffer.Length;
		System.IO.Stream output = response.OutputStream;
		output.Write(buffer, 0, buffer.Length);
		output.Close();
		listener.BeginGetContext(ListenerCallback, listener);
	}
	
	private static IntPtr SetHook(LowLevelKeyboardProc proc)
	{
		using (Process curProcess = Process.GetCurrentProcess())
		using (ProcessModule curModule = curProcess.MainModule)
		{
			return SetWindowsHookEx(WH_KEYBOARD_LL, proc,
				GetModuleHandle(curModule.ModuleName), 0);
		}
	}

	private delegate IntPtr LowLevelKeyboardProc(
		int nCode, IntPtr wParam, IntPtr lParam);

	private static IntPtr HookCallback(
		int nCode, IntPtr wParam, IntPtr lParam)
	{
		if (nCode >= 0 && wParam == (IntPtr)WM_KEYDOWN)
		{
			int vkCode = Marshal.ReadInt32(lParam);
			Console.WriteLine(vkCode + " " + (Keys)vkCode);
			if (vkCode == 36)// home
			{
				if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				{
					Console.WriteLine(vkCode + " " + (Keys) vkCode);
					hotKeyRaised = "pause";
					hotKeyPressed.Set();
					return lParam;
				}
			}

			if (vkCode == 33) //pgUp
			{
				if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				{
					Console.WriteLine(vkCode + " " + (Keys) vkCode);
					hotKeyRaised = "prev";
					hotKeyPressed.Set();
					return lParam;
				}
			}

			if (vkCode == 34) //pgDwn
			{
				if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				{
					Console.WriteLine(vkCode + " " + (Keys) vkCode);
					hotKeyRaised = "next";
					hotKeyPressed.Set();
					return lParam;
				}
			}
		}
		return CallNextHookEx(_hookID, nCode, wParam, lParam);
	}

	[DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
	private static extern IntPtr SetWindowsHookEx(int idHook,
		LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

	[DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
	[return: MarshalAs(UnmanagedType.Bool)]
	private static extern bool UnhookWindowsHookEx(IntPtr hhk);

	[DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
	private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode,
		IntPtr wParam, IntPtr lParam);

	[DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
	private static extern IntPtr GetModuleHandle(string lpModuleName);
}