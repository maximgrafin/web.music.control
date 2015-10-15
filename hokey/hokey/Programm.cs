using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;

internal class Programm
{
	private const int WH_KEYBOARD_LL = 13;
	private const int WM_KEYDOWN = 0x0100;
	private static LowLevelKeyboardProc _proc = HookCallback;
	private static IntPtr _hookID = IntPtr.Zero;
	private static string hotKeyRaised = "";
	private static int timeoutSeconds = 60;

	private static EventWaitHandle hotKeyPressed = new EventWaitHandle(false, EventResetMode.AutoReset);

	private static void Main(string[] args)
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
		HttpListener listener = (HttpListener) result.AsyncState;
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

		byte[] buffer = Encoding.UTF8.GetBytes(responseString);
		response.ContentLength64 = buffer.Length;
		Stream output = response.OutputStream;
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
		if (nCode >= 0 && wParam == (IntPtr) WM_KEYDOWN)
		{
			int pressedButtonCode = Marshal.ReadInt32(lParam);
			Console.WriteLine(pressedButtonCode + " " + (Keys) pressedButtonCode);

			if (IsPausePressed(pressedButtonCode))
				return Pause(lParam);

			if (IsPrevPressed(pressedButtonCode))
				return Prev(lParam);

			if (IsNextPressed(pressedButtonCode))
				return Next(lParam);
		}
		return CallNextHookEx(_hookID, nCode, wParam, lParam);
	}

	private static bool IsPausePressed(int pressedButtonCode)
	{
		if (pressedButtonCode == 36) // home
			if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				return true;

		if (pressedButtonCode == 179) // MediaPlayPause
			return true;

		return false;
	}

	private static bool IsNextPressed(int pressedButtonCode)
	{
		if (pressedButtonCode == 34) // pgDwn
			if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				return true;
		return false;
	}

	private static bool IsPrevPressed(int pressedButtonCode)
	{
		if (pressedButtonCode == 33) // pgUp
			if (Control.ModifierKeys.HasFlag(Keys.Control) && Control.ModifierKeys.HasFlag(Keys.Alt))
				return true;
		return false;
	}

	private static IntPtr Next(IntPtr lParam)
	{
		hotKeyRaised = "next";
		hotKeyPressed.Set();
		return lParam;
	}

	private static IntPtr Prev(IntPtr lParam)
	{
		hotKeyRaised = "prev";
		hotKeyPressed.Set();
		return lParam;
	}

	private static IntPtr Pause(IntPtr lParam)
	{
		hotKeyRaised = "pause";
		hotKeyPressed.Set();
		return lParam;
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