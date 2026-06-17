import http.server
import socketserver
import os
import webbrowser

PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler

# Cambiar al directorio del script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"=========================================================")
    print(f" Servidor de desarrollo de cónicas corriendo localmente ")
    print(f" URL: http://localhost:{PORT}")
    print(f"=========================================================")
    
    # Abrir en el navegador automáticamente
    webbrowser.open(f"http://localhost:{PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor apagado de forma segura.")
