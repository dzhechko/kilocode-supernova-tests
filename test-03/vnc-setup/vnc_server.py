#!/usr/bin/env python3
"""
Simple VNC Server for Virtual Display
This creates a basic VNC server that can work with noVNC
"""
import socket
import threading
import time
import struct
import subprocess
import os

class VNCServer:
    def __init__(self, host='localhost', port=5901, display=':1'):
        self.host = host
        self.port = port
        self.display = display
        self.clients = []
        self.running = False

    def start(self):
        """Start the VNC server"""
        self.running = True
        print(f"Starting VNC server on {self.host}:{self.port}")
        print(f"Virtual display: {self.display}")

        # Start Xvfb if not already running
        try:
            result = subprocess.run(['pgrep', 'Xvfb'], capture_output=True, text=True)
            if not result.stdout.strip():
                print("Starting Xvfb...")
                subprocess.Popen(['Xvfb', self.display, '-screen', '0', '1024x768x24'],
                               stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                time.sleep(2)
        except Exception as e:
            print(f"Warning: Could not start Xvfb: {e}")

        # Set display environment
        os.environ['DISPLAY'] = self.display

        # Start server thread
        server_thread = threading.Thread(target=self._server_loop)
        server_thread.daemon = True
        server_thread.start()

    def _server_loop(self):
        """Main server loop"""
        try:
            server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            server.bind((self.host, self.port))
            server.listen(5)
            print(f"VNC server listening on {self.host}:{self.port}")

            while self.running:
                try:
                    client, address = server.accept()
                    print(f"Client connected from {address}")
                    self.clients.append(client)
                    client_thread = threading.Thread(target=self._handle_client, args=(client,))
                    client_thread.daemon = True
                    client_thread.start()
                except Exception as e:
                    if self.running:
                        print(f"Error accepting connection: {e}")

        except Exception as e:
            print(f"Server error: {e}")
        finally:
            server.close()

    def _handle_client(self, client):
        """Handle individual client connection"""
        try:
            # Send VNC protocol version
            client.send(b'RFB 003.008\n')

            # Wait for client version
            version = client.recv(12)
            if not version:
                return

            print(f"Client version: {version.decode()}")

            # Send security types
            client.send(struct.pack('!I', 1))  # Number of security types
            client.send(struct.pack('!B', 1))  # None

            # Wait for security type selection
            sec_type = client.recv(1)
            if not sec_type:
                return

            # Send security result
            client.send(struct.pack('!I', 0))  # OK

            # Wait for client init
            client.recv(1)

            # Send server init
            width, height = 1024, 768
            server_init = struct.pack('!HH16sI', width, height, b'Virtual Display', 32)
            client.send(server_init)

            # Send color map (for 8-bit color)
            client.send(struct.pack('!H', 0))  # No color map

            # Send bell, LED state
            client.send(struct.pack('!B', 0))  # Bell off
            client.send(struct.pack('!B', 0))  # LED off

            # Send name
            name = 'Godot Game Server'
            client.send(struct.pack('!I', len(name)))
            client.send(name.encode())

            print("VNC handshake completed")

            # Keep connection alive
            while self.running:
                try:
                    data = client.recv(1024)
                    if not data:
                        break
                    # Echo back for basic functionality
                    client.send(data)
                except:
                    break

        except Exception as e:
            print(f"Client handling error: {e}")
        finally:
            if client in self.clients:
                self.clients.remove(client)
            client.close()

    def stop(self):
        """Stop the VNC server"""
        self.running = False
        for client in self.clients:
            try:
                client.close()
            except:
                pass
        self.clients.clear()
        print("VNC server stopped")

def main():
    # Create and start VNC server
    vnc_server = VNCServer(port=5901)
    vnc_server.start()

    try:
        # Keep running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("Shutting down...")
    finally:
        vnc_server.stop()

if __name__ == '__main__':
    main()