"use client";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, CheckCircle, AlertTriangle, Trash2, Database, Info } from "lucide-react";
import { useState } from "react";
import DatabaseViewer from "@/components/DatabaseViewer";

export default function SyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingSource, setIsUpdatingSource] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewerKey, setViewerKey] = useState(0);
  const [cleanupMode, setCleanupMode] = useState(true);
  const [soldCount, setSoldCount] = useState<number | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/cars/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offset: 0,
          limit: 50,
          cleanupMode: cleanupMode
        }),
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

  const handleUpdateSource = async () => {
    setIsUpdatingSource(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/cars/update-source', {
        method: 'POST',
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Ocurrió un error durante la actualización.');
      setFeedback({ message: result.message, type: 'success' });
      setViewerKey(prevKey => prevKey + 1); // Refresh the viewer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setIsUpdatingSource(false);
    }
  };

  const handleCountSold = async () => {
    try {
      const response = await fetch('/api/cars/cleanup-sold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'count_sold',
          source: 'feed'
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al contar coches vendidos.');
      setSoldCount(result.soldCount);
      setFeedback({ message: result.message, type: 'success' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió.';
      setFeedback({ message: errorMessage, type: 'error' });
    }
  };

  const handleCleanupSold = async () => {
    if (!confirm(`¿Estás seguro de que quieres eliminar ${soldCount} coches vendidos? Esta acción no se puede deshacer.`)) {
      return;
    }

    setIsCleaningUp(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/cars/cleanup-sold', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_sold',
          source: 'feed'
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al eliminar coches vendidos.');
      setFeedback({ message: result.message, type: 'success' });
      setSoldCount(null);
      setViewerKey(prevKey => prevKey + 1); // Refresh the viewer
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preparar Base de Datos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Antes de sincronizar, es necesario actualizar los coches existentes para marcarlos correctamente según su origen.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Este paso solo es necesario la primera vez después de la actualización. Marca todos los coches existentes como provenientes del feed.
            </p>
          </div>
          
          <Button onClick={handleUpdateSource} disabled={isUpdatingSource} variant="outline">
            <Database className={`mr-2 h-4 w-4 ${isUpdatingSource ? 'animate-spin' : ''}`} />
            {isUpdatingSource ? 'Actualizando...' : 'Actualizar Origen de Coches Existentes'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Sincronizar Coches desde el Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Haz clic en el botón para iniciar el proceso de sincronización. El sistema se conectará al feed de datos, leerá todos los coches y actualizará la base de datos local. Este proceso puede tardar varios minutos.
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="cleanupMode" 
              checked={cleanupMode} 
              onCheckedChange={(checked) => setCleanupMode(checked as boolean)}
            />
            <label htmlFor="cleanupMode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Limpieza automática (marcar como vendidos los coches que ya no están en el feed)
            </label>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Limpieza automática:</strong> Cuando está activada, el sistema automáticamente marca como vendidos todos los coches que ya no aparecen en el feed. Esto mantiene tu inventario sincronizado con la realidad del feed.
            </p>
          </div>
          
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Gestión de Coches Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Los coches marcados como vendidos durante la sincronización se pueden gestionar desde aquí. Puedes eliminarlos manualmente si es necesario o mantenerlos para historial.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Los coches vendidos no aparecen en las búsquedas normales pero se mantienen en la base de datos para auditoría y posibles recuperaciones.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleCountSold} variant="outline">
              <Info className="mr-2 h-4 w-4" />
              Contar Coches Vendidos
            </Button>
            
            {soldCount !== null && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Coches vendidos: {soldCount}</span>
                <Button 
                  onClick={handleCleanupSold} 
                  disabled={isCleaningUp || soldCount === 0}
                  variant="destructive"
                  size="sm"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {isCleaningUp ? 'Eliminando...' : 'Eliminar Todos'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DatabaseViewer refreshKey={viewerKey} />
    </div>
  );
} 