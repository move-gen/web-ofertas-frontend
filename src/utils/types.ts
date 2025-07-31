import { Car as PrismaCar, Image as PrismaImage, Offer as PrismaOffer } from '@prisma/client';

export type CarImage = PrismaImage;
export type Offer = PrismaOffer;

export type Car = Omit<PrismaCar, 'createdAt' | 'updatedAt'> & {
    id: number;
    name: string;
    description: string | null;
    sku: string;
    numberplate: string | null;
    kms: number;
    year: number;
    fuel: string;
    bodytype: string;
    version: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    images?: CarImage[];
  };
  
export interface ApiResponse<T> {
    data: T;
    message?: string;
}


// Other interfaces for services like Strapi can go here
export interface StrapiAuthResponse {
    jwt: string;
    user: {
        id: number;
        username: string;
        email: string;
    }
}

export interface StrapiCredentials {
    identifier?: string;
    email?: string;
    password?: string;
} 