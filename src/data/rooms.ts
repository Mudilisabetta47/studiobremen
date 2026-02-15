import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomApartment from "@/assets/room-apartment.jpg";

export interface Room {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  image: string;
  guests: number;
  size: string;
  amenities: string[];
}

export const rooms: Room[] = [
  {
    id: "deluxe-zimmer",
    title: "Deluxe Zimmer",
    description: "Elegantes Zimmer mit King-Size-Bett, modernem Bad und Blick auf die Stadt.",
    longDescription: "Unser Deluxe Zimmer bietet Ihnen erstklassigen Komfort auf 28 m². Genießen Sie den Blick auf die Bremer Altstadt von Ihrem King-Size-Bett aus. Das moderne Badezimmer mit Regendusche und hochwertigen Pflegeprodukten rundet Ihren Aufenthalt ab.",
    price: 119,
    image: roomDeluxe,
    guests: 2,
    size: "28 m²",
    amenities: ["King-Size-Bett", "Regendusche", "Smart-TV", "WLAN", "Minibar", "Klimaanlage", "Safe", "Schreibtisch"],
  },
  {
    id: "premium-suite",
    title: "Premium Suite",
    description: "Großzügige Suite mit separatem Wohnbereich und luxuriöser Ausstattung.",
    longDescription: "Die Premium Suite ist unser Flaggschiff – 55 m² purer Luxus. Ein separater Wohnbereich mit Designer-Möbeln, ein King-Size-Bett mit ägyptischer Baumwolle und ein marmornes Badezimmer mit freistehender Badewanne erwarten Sie.",
    price: 219,
    image: roomSuite,
    guests: 3,
    size: "55 m²",
    amenities: ["King-Size-Bett", "Wohnbereich", "Freistehende Badewanne", "Smart-TV", "WLAN", "Minibar", "Nespresso", "Klimaanlage", "Safe", "Bademantel & Pantoffeln"],
  },
  {
    id: "city-apartment",
    title: "City Apartment",
    description: "Voll ausgestattetes Apartment mit Küche – ideal für längere Aufenthalte.",
    longDescription: "Unser City Apartment bietet auf 40 m² alles, was Sie für einen längeren Aufenthalt brauchen: eine komplett ausgestattete Küchenzeile, einen gemütlichen Wohnbereich und ein komfortables Schlafzimmer. Perfekt für Geschäftsreisende und Familien.",
    price: 149,
    image: roomApartment,
    guests: 4,
    size: "40 m²",
    amenities: ["Doppelbett", "Küchenzeile", "Wohnbereich", "Smart-TV", "WLAN", "Waschmaschine", "Klimaanlage", "Safe", "Schreibtisch", "Geschirrspüler"],
  },
];
