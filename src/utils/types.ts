import type { Car as PrismaCar, Image as PrismaImage, Offer as PrismaOffer } from "@prisma/client";

// We re-export the Prisma types and can extend them if needed.
// This ensures our frontend types always match the database schema.
export type CarImage = PrismaImage;

export type Car = PrismaCar & {
  images: CarImage[];
  numberplate?: string | null; // Manually adding because it's optional
};

export type Offer = PrismaOffer;


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