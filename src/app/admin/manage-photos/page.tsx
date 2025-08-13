"use client";
import { useState, useEffect, useReducer, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search, Trash2, Upload, Star, BadgeCheck } from 'lucide-react';
import { getToken } from '@/utils/auth';
import { Car, CarImage } from '@/utils/types';
import Image from 'next/image';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

type CarWithImages = Car & { images: CarImage[] };

export default function ManagePhotosPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<Car[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [selectedCar, setSelectedCar] = useState<CarWithImages | null>(null);
    const [isLoadingCar, setIsLoadingCar] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [reducer, forceUpdate] = useReducer(x => x + 1, 0);

    // Effect for searching cars
    useEffect(() => {
        const searchCars = async (term: string) => {
            if (term.length < 2) {
                setSearchResults([]);
                return;
            }
            setIsSearching(true);
            try {
                const token = getToken();
                const response = await fetch(`/api/cars/search?term=${term}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!response.ok) throw new Error('Error al buscar coches');
                const data: Car[] = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error(error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }
        searchCars(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    
    // Effect to refetch car details when reducer is forced
    useEffect(() => {
        const refetchCar = async () => {
            if (selectedCar) {
                await handleSelectCar(selectedCar);
            }
        };
        refetchCar();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reducer]);

    const handleSelectCar = async (car: Car) => {
        setIsLoadingCar(true);
        setSelectedCar(null);
        setSearchTerm('');
        setSearchResults([]);
        try {
            const token = getToken();
            const response = await fetch(`/api/cars/${car.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo cargar el coche');
            const data: CarWithImages = await response.json();
            setSelectedCar(data);
        } catch (error) {
            console.error(error);
            alert('Error al cargar los detalles del coche.');
        } finally {
            setIsLoadingCar(false);
        }
    };
    
    const handleDeleteImage = async (imageId: number) => {
        if (!confirm('¿Seguro que quieres eliminar esta imagen?')) return;
        try {
            const token = getToken();
            const response = await fetch(`/api/images/${imageId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo eliminar la imagen');
            forceUpdate();
        } catch (error) {
            console.error(error);
            alert('Error al eliminar la imagen.');
        }
    };

    const handleSetPrimary = async (imageId: number) => {
        try {
            const token = getToken();
            const response = await fetch(`/api/images/${imageId}/set-primary`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('No se pudo establecer como principal');
            forceUpdate();
        } catch (error) {
            console.error(error);
            alert('Error al establecer como principal.');
        }
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !selectedCar) return;
        const file = event.target.files[0];
        setIsUploading(true);
        try {
            const token = getToken();
            const response = await fetch(`/api/cars/${selectedCar.id}/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': file.type,
                    'X-Vercel-Filename': file.name,
                    'Authorization': `Bearer ${token}`,
                },
                body: file,
            });
            if (!response.ok) throw new Error('La subida ha fallado');
            forceUpdate();
        } catch (error) {
            console.error(error);
            alert('Error al subir la imagen.');
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = "";
        }
    };


    return (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Paso 1: Buscar Vehículo</CardTitle>
                    <CardDescription>Busca un vehículo por su matrícula para gestionar sus fotos.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative w-full max-w-lg">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                            id="car-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar por nombre o matrícula..."
                            className="pl-10"
                            disabled={!!selectedCar}
                        />
                        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin" />}
                    </div>
                    {searchResults.length > 0 && (
                        <div className="mt-2 max-h-60 overflow-y-auto border rounded-md">
                            <ul className="divide-y">
                                {searchResults.map(car => (
                                    <li key={car.id} onClick={() => handleSelectCar(car)} className="p-3 flex items-center space-x-3 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex-1">
                                            <p className="font-medium text-sm">{car.name}</p>
                                            <p className="text-xs text-gray-500">{car.numberplate || 'Sin matrícula'}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isLoadingCar && (
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="ml-4">Cargando imágenes del vehículo...</p>
                </div>
            )}

            {selectedCar && (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>Paso 2: Gestionar Fotos de &quot;{selectedCar.name}&quot;</CardTitle>
                                <CardDescription>{selectedCar.numberplate}</CardDescription>
                            </div>
                            <Button variant="outline" onClick={() => setSelectedCar(null)}>Buscar otro coche</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {/* Upload Card */}
                            <div className="relative border-2 border-dashed rounded-lg p-4 flex items-center justify-center h-48">
                                <div className="text-center">
                                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">Subir nueva foto</p>
                                    <Button size="sm" className="mt-2" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Seleccionar"}
                                    </Button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleUpload}
                                        className="hidden"
                                        accept="image/jpeg, image/png, image/webp"
                                    />
                                </div>
                            </div>
                            
                            {/* Image Gallery */}
                            {selectedCar.images.map(image => (
                                <div key={image.id} className="relative group h-48">
                                    <Image
                                        src={image.url}
                                        alt={`Foto de ${selectedCar.name}`}
                                        width={200}
                                        height={200}
                                        className={cn(
                                            "w-full h-full object-cover rounded-lg",
                                            image.isPrimary && "ring-4 ring-offset-2 ring-blue-500"
                                        )}
                                    />
                                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDeleteImage(image.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {!image.isPrimary && (
                                            <Button size="icon" className="bg-blue-500 hover:bg-blue-600 h-8 w-8" onClick={() => handleSetPrimary(image.id)}>
                                                <Star className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="absolute bottom-1 left-1">
                                        {image.isPrimary && (
                                            <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                                                <BadgeCheck className="h-3 w-3" /> Principal
                                            </div>
                                        )}
                                        <div className={cn(
                                            "text-white text-xs font-bold px-2 py-1 rounded-full mt-1",
                                            image.source === 'manual' ? 'bg-green-600' : 'bg-gray-500'
                                        )}>
                                            {image.source === 'manual' ? 'Manual' : 'Feed'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 