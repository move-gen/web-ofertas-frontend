"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";
import DatabaseViewer from "@/components/DatabaseViewer";

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewerKey, setViewerKey] = useState(0);

  const handleSync = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/cars/sync', {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ocurrió un error durante la sincronización.');
      setFeedback({ message: result.message, type: 'success' });
      setViewerKey(prevKey => prevKey + 1); // Refresh the viewer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="max-w-xl">
        <CardHeader><CardTitle>Sincronizar Coches desde el Feed</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Haz clic en el botón para iniciar el proceso de sincronización. El sistema se conectará al feed de datos, leerá todos los coches y actualizará la base de datos local. Este proceso puede tardar varios minutos.
          </p>
          <Button onClick={handleSync} disabled={isLoading} size="lg">
            <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Sincronizando...' : 'Iniciar Sincronización Ahora'}
          </Button>
        </CardContent>
        {feedback && (
          <CardFooter>
            <div className={`w-full p-3 rounded-md text-sm flex items-start space-x-2 ${feedback.type === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'}`}>
              {feedback.type === 'success' ? <CheckCircle className="h-4 w-4 mt-0.5" /> : <AlertTriangle className="h-4 w-4 mt-0.5" />}
              <span>{feedback.message}</span>
            </div>
          </CardFooter>
        )}
      </Card>

      <DatabaseViewer refreshKey={viewerKey} />
    </div>
  );
} 