'use client';

import { useState, useEffect } from 'react';

interface TestResult {
  success: boolean;
  message?: string;
  backendResponse?: string;
  error?: string;
  details?: string;
}

export default function TestConnectionPage() {
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-connection');
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Error al hacer la petición',
        details: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>🧪 Prueba de Conexión con el Backend</h1>
      
      <button
        onClick={testConnection}
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        {loading ? 'Probando...' : 'Probar conexión'}
      </button>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor:'rgb(27, 95, 0)' }}>
          <h2 style={{ color: result.success ? '#00a080' : '#c53030' }}>
            {result.success ? '✅ Conexión exitosa' : '❌ Error de conexión'}
          </h2>
          
          {result.message && <p><strong>Mensaje:</strong> {result.message}</p>}
          {result.backendResponse && (
            <p><strong>Respuesta del backend:</strong> {result.backendResponse}</p>
          )}
          {result.error && <p><strong>Error:</strong> {result.error}</p>}
          {result.details && <p><strong>Detalles:</strong> {result.details}</p>}
        </div>
      )}

      <div style={{ marginTop: '30px', fontSize: '14px', color: '#666' }}>
        <p><strong>Nota:</strong> Asegurate de que el backend esté corriendo en http://localhost:4000</p>
      </div>
    </div>
  );
}