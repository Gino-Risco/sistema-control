# scan_qr.py
# Escáner de QR para registro de asistencia
# Requiere: Python 3.7+, OpenCV, requests

import cv2
import requests
import time
import sys

# Configuración
BACKEND_URL = "http://localhost:5000/api/asistencia"  
CAMERA_INDEX = 0  

def main():
    print("🚀 Iniciando sistema de escaneo QR para asistencia...")
    print(f"📡 Enviando registros a: {BACKEND_URL}")
    print("⏹️  Presiona 'q' en la ventana de la cámara para salir.\n")

    # Iniciar cámara
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print("❌ Error: No se pudo acceder a la cámara.")
        sys.exit(1)

    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    last_scan_time = 0
    cooldown = 3  

    while True:
        ret, frame = cap.read()
        if not ret:
            print("❌ Error al capturar el frame.")
            break

        detector = cv2.QRCodeDetector()
        data, bbox, _ = detector.detectAndDecode(frame)

        current_time = time.time()

        if bbox is not None:
            
            bbox = bbox[0].astype(int)
            for i in range(len(bbox)):
                pt1 = tuple(bbox[i])
                pt2 = tuple(bbox[(i + 1) % len(bbox)])
                cv2.line(frame, pt1, pt2, (0, 255, 0), 3)

            if data and (current_time - last_scan_time) > cooldown:
                print(f"✅ QR detectado: {data}")
                
                try:
                    response = requests.post(
                        BACKEND_URL,
                        json={"codigo_qr": data},
                        timeout=5
                    )
                    
                    if response.status_code == 200:
                        print("✔️  Asistencia registrada exitosamente.")
                        cv2.putText(frame, "REGISTRADO", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 3)
                    else:
                        error_msg = response.json().get("error", "Error desconocido")
                        print(f"❌ Error del servidor: {error_msg}")
                        cv2.putText(frame, "ERROR", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                        
                except requests.exceptions.ConnectionError:
                    print("❌ Error: No se puede conectar con el backend.")
                    cv2.putText(frame, "SIN CONEXIÓN", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)
                except Exception as e:
                    print(f"❌ Error inesperado: {e}")
                    cv2.putText(frame, "ERROR", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 3)

                last_scan_time = current_time

        cv2.putText(frame, "Escanea tu QR | Presiona 'q' para salir", 
                    (10, frame.shape[0] - 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, 
                    0.6, (255, 255, 255), 1)

        cv2.imshow('Sistema de Asistencia - Escáner QR', frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("\n👋 Sistema detenido.")

if __name__ == "__main__":
    main()