import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarIcon, Users, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

const bookingSchema = z.object({
  guest_name: z.string().trim().min(2, "Name muss mindestens 2 Zeichen haben").max(100),
  guest_email: z.string().trim().email("Ungültige E-Mail-Adresse").max(255),
  guest_phone: z.string().trim().max(30).optional(),
  check_in: z.date({ required_error: "Bitte Anreisedatum wählen" }),
  check_out: z.date({ required_error: "Bitte Abreisedatum wählen" }),
  guests_count: z.coerce.number().min(1).max(10),
  notes: z.string().trim().max(500).optional(),
}).refine((d) => d.check_out > d.check_in, {
  message: "Abreise muss nach Anreise liegen",
  path: ["check_out"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  roomId: string;
  roomTitle: string;
  pricePerNight: number;
  maxGuests: number;
  smoobuApartmentId?: string;
}

const BookingForm = ({ roomId, roomTitle, pricePerNight, maxGuests, smoobuApartmentId }: BookingFormProps) => {
  const [step, setStep] = useState<"form" | "checking" | "confirmed">("form");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      guests_count: 2,
      guest_name: "",
      guest_email: "",
      guest_phone: "",
      notes: "",
    },
  });

  const checkIn = form.watch("check_in");
  const checkOut = form.watch("check_out");

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;
  const totalPrice = nights * pricePerNight;

  const onSubmit = async (values: BookingFormValues) => {
    setStep("checking");
    setAvailabilityError(null);

    try {
      const checkInStr = format(values.check_in, "yyyy-MM-dd");
      const checkOutStr = format(values.check_out, "yyyy-MM-dd");

      // Call smoobu-sync edge function to check availability and create booking
      const { data, error } = await supabase.functions.invoke("smoobu-sync", {
        body: {
          action: "create-booking",
          apartment_id: smoobuApartmentId || roomId,
          room_id: roomId,
          check_in: checkInStr,
          check_out: checkOutStr,
          guest_name: values.guest_name,
          guest_email: values.guest_email,
          guest_phone: values.guest_phone || "",
          guests_count: values.guests_count,
          notes: values.notes || "",
        },
      });

      if (error) throw new Error(error.message);

      if (!data?.success) {
        setAvailabilityError(data?.error || "Buchung konnte nicht erstellt werden.");
        setStep("form");
        return;
      }

      // Build QR data
      const qr = JSON.stringify({
        booking_id: data.booking?.id,
        guest: values.guest_name,
        room: roomTitle,
        check_in: checkInStr,
        check_out: checkOutStr,
      });
      setQrData(qr);
      setBookingDetails({
        ...data.booking,
        guest_name: values.guest_name,
        guest_email: values.guest_email,
        check_in: checkInStr,
        check_out: checkOutStr,
        nights,
        totalPrice,
      });
      setStep("confirmed");

      toast({
        title: "Buchung bestätigt!",
        description: `${roomTitle} vom ${format(values.check_in, "dd.MM.yyyy")} bis ${format(values.check_out, "dd.MM.yyyy")}`,
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setAvailabilityError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setStep("form");
    }
  };

  if (step === "confirmed" && bookingDetails && qrData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-8 text-center"
      >
        <CheckCircle2 className="mx-auto mb-4 text-accent" size={48} />
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Buchung bestätigt!</h3>
        <p className="font-body text-muted-foreground mb-6">
          Vielen Dank, {bookingDetails.guest_name}. Ihre Buchung wurde erfolgreich erstellt.
        </p>

        <div className="bg-secondary/50 rounded-lg p-6 mb-6 text-left space-y-2 font-body text-sm">
          <p><span className="text-muted-foreground">Zimmer:</span> <strong>{roomTitle}</strong></p>
          <p><span className="text-muted-foreground">Anreise:</span> <strong>{bookingDetails.check_in}</strong></p>
          <p><span className="text-muted-foreground">Abreise:</span> <strong>{bookingDetails.check_out}</strong></p>
          <p><span className="text-muted-foreground">Nächte:</span> <strong>{bookingDetails.nights}</strong></p>
          <p><span className="text-muted-foreground">Gesamtpreis:</span> <strong>€{bookingDetails.totalPrice}</strong></p>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <QRCodeSVG value={qrData} size={180} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground font-body">
          Bitte zeigen Sie diesen QR-Code beim Check-in vor.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-6 md:p-8"
    >
      <h3 className="font-display text-xl font-semibold text-foreground mb-6">
        {roomTitle} buchen
      </h3>

      <AnimatePresence>
        {availabilityError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/10 border border-destructive/30 rounded-md p-3 mb-4 flex items-start gap-2"
          >
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive font-body">{availabilityError}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="check_in"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon size={14} /> Anreise
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="check_out"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <CalendarIcon size={14} /> Abreise
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "dd.MM.yyyy", { locale: de }) : "Datum wählen"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date <= (checkIn || new Date())}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guests_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Users size={14} /> Gäste
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Array.from({ length: maxGuests }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>{i + 1} {i === 0 ? "Gast" : "Gäste"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="guest_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Name</FormLabel>
                  <FormControl><Input placeholder="Max Mustermann" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="guest_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">E-Mail</FormLabel>
                  <FormControl><Input type="email" placeholder="max@beispiel.de" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="guest_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Telefon (optional)</FormLabel>
                <FormControl><Input placeholder="+49 ..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Anmerkungen (optional)</FormLabel>
                <FormControl><Textarea placeholder="Besondere Wünsche..." rows={3} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {nights > 0 && (
            <div className="bg-secondary/50 rounded-md p-4 flex justify-between items-center font-body">
              <span className="text-sm text-muted-foreground">{nights} {nights === 1 ? "Nacht" : "Nächte"} × €{pricePerNight}</span>
              <span className="font-display text-xl font-bold text-foreground">€{totalPrice}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            size="lg"
            disabled={step === "checking"}
          >
            {step === "checking" ? (
              <><Loader2 className="animate-spin" size={16} /> Verfügbarkeit wird geprüft...</>
            ) : (
              "Jetzt verbindlich buchen"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center font-body">
            Kostenlose Stornierung bis 48h vor Anreise
          </p>
        </form>
      </Form>
    </motion.div>
  );
};

export default BookingForm;
