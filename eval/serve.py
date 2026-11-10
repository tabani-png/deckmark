#!/usr/bin/env python3
"""serve.py: the eval gallery on http://127.0.0.1:4202 (loopback only, never 0.0.0.0).

python3 eval/serve.py    (PORT overrides the port)
"""

import functools
import http.server
import os
import socketserver
from pathlib import Path

PORT = int(os.environ.get("PORT", "4202"))
ROOT = str(Path(__file__).resolve().parent)

if __name__ == "__main__":
    handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.daemon_threads = True
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), handler) as httpd:
        print(f"serving {ROOT} on http://127.0.0.1:{PORT}/index.html", flush=True)
        httpd.serve_forever()
