"use client";

import { useState } from 'react';
import withAuth from '@/components/withAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { LinkIcon, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

function AdminCampaignCreatorPage() {
  const [offerTitle, setOfferTitle] = useState('');
  const [csvUrl, setCsvUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error';
    offerUrl?: string;
  } | null>(null);

  const handleCreateCampaign = async () => {
    if (!offerTitle || !csvUrl) {
      setFeedback({ message: 'Por favor, introduce un título y una URL.', type: 'error' });
      return;
    }
    setIsLoading(true);
    setFeedback(null);

    try {
      // This will be our new API endpoint
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerTitle, csvUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Ocurrió un error al crear la campaña.');
      }

      setFeedback({
        message: '¡Campaña creada con éxito!',
        type: 'success',
        offerUrl: result.offerUrl,
      });
      setOfferTitle('');
      setCsvUrl('');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Un error desconocido ocurrió.';
      setFeedback({ message: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Crear Nueva Campaña de Ofertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="offer-title" className="font-medium">Título de la Oferta</label>
          <Input
            id="offer-title"
            value={offerTitle}
            onChange={(e) => setOfferTitle(e.target.value)}
            placeholder="Ej: Ofertas de Verano 2024"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="csv-url" className="font-medium">URL del Archivo CSV</label>
          <div className="flex items-center">
            <LinkIcon className="h-5 w-5 text-gray-400 mr-2" />
            <Input
              id="csv-url"
              type="url"
              value={csvUrl}
              onChange={(e) => setCsvUrl(e.target.value)}
              placeholder="https://ejemplo.com/coches.csv"
              disabled={isLoading}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <Button onClick={handleCreateCampaign} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isLoading ? 'Creando Campaña...' : 'Crear Campaña y Generar URL'}
        </Button>
        {feedback && (
          <div className={`w-full p-4 rounded-md text-sm flex items-start space-x-3 ${
            feedback.type === 'success' ? 'bg-green-100 text-green-900' : 'bg-red-100 text-red-900'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
            <div>
              <p className="font-semibold">{feedback.message}</p>
              {feedback.type === 'success' && feedback.offerUrl && (
                <div className="mt-2">
                  <p>URL de la oferta:</p>
                  <a 
                    href={feedback.offerUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="font-mono bg-green-200 px-2 py-1 rounded hover:underline"
                  >
                    {feedback.offerUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default withAuth(AdminCampaignCreatorPage); 