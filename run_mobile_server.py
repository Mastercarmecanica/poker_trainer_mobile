#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
====================================================================
POKERDOJO MOBILE - SERVIDOR LOCAL PARA TELÉFONO EN LA MISMA RED WI-FI
====================================================================
Detecta la dirección IP de tu computadora, genera un Código QR en
consola y levanta un servidor HTTP ligero optimizado para móviles.
"""

import os
import sys
import socket
import http.server
import socketserver
import subprocess

# Asegurar codificación UTF-8 en terminales de Windows
if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_local_ip():
    """Obtiene la dirección IP local de la computadora en la red Wi-Fi."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Conecta sin transferir datos para resolver la IP local activa
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
    except Exception:
        try:
            ip = socket.gethostbyname(socket.gethostname())
        except Exception:
            ip = '127.0.0.1'
    finally:
        s.close()
    return ip

def print_qr_code(url):
    """Genera e imprime el código QR en la consola."""
    try:
        import qrcode
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=1,
            border=2,
        )
        qr.add_data(url)
        qr.make(fit=True)
        
        print("\n" + "=" * 50)
        print("   📱 ESCANEA CON LA CÁMARA DE TU CELULAR")
        print("=" * 50 + "\n")
        qr.print_ascii(invert=True)
        print("\n" + "=" * 50)
    except Exception as e:
        print(f"\n👉 Abre directamente en el navegador del teléfono: {url}")

class CustomMobileHandler(http.server.SimpleHTTPRequestHandler):
    """Manejador HTTP con soporte MIME adecuado y sin almacenamiento de caché."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        sys.stdout.write(f"  [Móvil Conectado] {args[0]} {args[1]}\n")

def run():
    ip = get_local_ip()
    url = f"http://{ip}:{PORT}"

    print("\n" + "═" * 54)
    print("   🥋 POKERDOJO MOBILE - SERVIDOR LOCAL ACTIVO")
    print("═" * 54)
    print(f"\n  📡 URL EN TU RED WI-FI:")
    print(f"  👉 {url}")
    print(f"\n  💻 URL LOCAL EN ESTA PC:")
    print(f"  👉 http://localhost:{PORT}")
    
    print_qr_code(url)

    print("\n💡 PASOS RÁPIDOS:")
    print("  1. Conecta tu celular al mismo Wi-Fi de esta PC.")
    print("  2. Escanea el QR con la cámara o escribe la URL en Safari/Chrome.")
    print("  3. En Safari: 'Compartir' -> 'Añadir a pantalla de inicio'.")
    print("  4. En Chrome: Menú (⋮) -> 'Instalar aplicación'.")
    print("  Presiona Ctrl + C en esta ventana para apagar el servidor.\n")
    print("═" * 54 + "\n")

    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), CustomMobileHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido. ¡Hasta la próxima mano en PokerDojo!\n")
    except Exception as e:
        print(f"\n❌ Error al iniciar servidor: {e}")

if __name__ == '__main__':
    run()
