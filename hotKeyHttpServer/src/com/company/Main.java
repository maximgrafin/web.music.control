package com.company;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.Condition;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
	private final static ReentrantLock lock = new ReentrantLock();
	private final static Condition eventHappened = lock.newCondition();
	private static String lastCommand = null;

	public static void main(String[] args) throws Exception {
		eventHandler eventHandler = new eventHandler();
		hotKeyServerHandler hotKeyServerHandler = new hotKeyServerHandler();

		HttpServer hotKeyServer = HttpServer.create(new InetSocketAddress(18711), 0);
		hotKeyServer.createContext("/hotkeys", hotKeyServerHandler);
		hotKeyServer.createContext("/event", eventHandler);
		hotKeyServer.setExecutor(java.util.concurrent.Executors.newCachedThreadPool()); // creates a default executor
		hotKeyServer.start();
	}

	static class hotKeyServerHandler implements HttpHandler {
		@Override
		public void handle(HttpExchange t) throws IOException {
			lock.lock();
			try {
				if (lastCommand != null) {
					System.out.println("hotKeyServerHandler: " + lastCommand);
					sendResponse(lastCommand, t);
				} else {
					if (!eventHappened.await(10L, TimeUnit.SECONDS)) {
						lastCommand = "nothing";
					}
					System.out.println("hotKeyServerHandler: " + lastCommand);
					sendResponse(lastCommand, t);
				}
			} catch (Exception e) {
				System.out.println("hotKeyServerHandler failed: " + e.toString());
				e.printStackTrace();
			} finally {
				lock.unlock();
				lastCommand = null;
			}
		}
	}

	static class eventHandler implements HttpHandler {

		@Override
		public void handle(HttpExchange t) throws IOException {
			lock.lock();
			try {
				System.out.println("eventHandler: " + t.getRequestURI().getQuery());
				lastCommand = t.getRequestURI().getQuery();
				sendResponse("accepted: " + lastCommand, t);
				synchronized (lock) {
					eventHappened.signal();
				}
			} catch (Exception e) {
				System.out.println("eventHandler exception: " + e.toString());
				e.printStackTrace();
			} finally {
				lock.unlock();
			}
		}
	}

	private static void sendResponse(String response, HttpExchange t) throws IOException {
		t.sendResponseHeaders(200, response.length());
		OutputStream os = t.getResponseBody();
		os.write(response.getBytes());
		os.close();
	}
}
