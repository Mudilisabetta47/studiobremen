import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  CalendarIcon, Users, Loader2, CheckCircle2, AlertCircle,
  CreditCard, User, ArrowRight, ArrowLeft, Shield, Clock, MapPin,
} from "lucide-react";
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

type Step = "dates" | "details" | "summary" | "checking" | "confirmed";

interface BookingFormProps {
  roomId: string;
  roomTitle: string;
  pricePerNight: number;
  maxGuests: number;
  smoobuApartmentId?: string;
}

const stepLabels: Record<string, string> = {
  dates: "Reisedaten",
  details: "Ihre Daten",
  summary: "Bestätigung",
};

const BookingForm = ({ roomId, roomTitle, pricePerNight, maxGuests, smoobuApartmentId }: BookingFormProps) => {
  const [step, setStep] = useState<Step>("dates");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const isPreviewSession = !!searchParams?.has("__lovable_token");
  const sandboxForced = searchParams?.get("sandbox") === "1";
  const isSandboxMode = isPreviewSession || sandboxForced;

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

  const activeSteps = ["dates", "details", "summary"] as const;
  const currentIndex = activeSteps.indexOf(step as any);

  const goNext = async () => {
    if (step === "dates") {
      const valid = await form.trigger(["check_in", "check_out", "guests_count"]);
      if (valid) setStep("details");
    } else if (step === "details") {
      const valid = await form.trigger(["guest_name", "guest_email", "guest_phone", "notes"]);
      if (valid) setStep("summary");
    }
  };

  const goBack = () => {
    if (step === "details") setStep("dates");
    else if (step === "summary") setStep("details");
  };

  const onSubmit = async (values: BookingFormValues) => {
    setStep("checking");
    setAvailabilityError(null);

    try {
      const checkInStr = format(values.check_in, "yyyy-MM-dd");
      const checkOutStr = format(values.check_out, "yyyy-MM-dd");
      const action = isSandboxMode ? "create-booking-sandbox" : "create-booking";

      const { data, error } = await supabase.functions.invoke("smoobu-sync", {
        body: {
          action,
          apartment_id: smoobuApartmentId || roomId,
          room_id: roomId,
          check_in: checkInStr,
          check_out: checkOutStr,
          guest_name: values.guest_name,
          guest_email: values.guest_email,
          guest_phone: values.guest_phone || "",
          guests_count: values.guests_count,
          notes: values.notes || "",
          total_price: totalPrice,
        },
      });

      if (error) throw new Error(error.message);

      if (!data?.success) {
        setAvailabilityError(data?.error || "Buchung konnte nicht erstellt werden.");
        setStep("summary");
        return;
      }

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
        sandbox: data.sandbox === true,
        guest_name: values.guest_name,
        guest_email: values.guest_email,
        check_in: checkInStr,
        check_out: checkOutStr,
        nights,
        totalPrice,
      });
      setStep("confirmed");

      toast({
        title: data.sandbox ? "Testbuchung erstellt" : "Buchung bestätigt!",
        description: `${roomTitle} vom ${format(values.check_in, "dd.MM.yyyy")} bis ${format(values.check_out, "dd.MM.yyyy")}`,
      });
    } catch (err: any) {
      console.error("Booking error:", err);
      setAvailabilityError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setStep("summary");
    }
  };

  // ── Confirmed view ──
  if (step === "confirmed" && bookingDetails && qrData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border border-border rounded-lg p-8 text-center"
      >
        <CheckCircle2 className="mx-auto mb-4 text-accent" size={48} />
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          {bookingDetails.sandbox ? "Testbuchung bestätigt" : "Buchung bestätigt!"}
        </h3>
        <p className="font-body text-muted-foreground mb-6">
          {bookingDetails.sandbox
            ? "Sandmodus aktiv: Dies ist eine nicht-verbindliche Testbuchung."
            : `Vielen Dank, ${bookingDetails.guest_name}. Ihre Reservierung wurde erfolgreich erstellt.`}
        </p>

        <div className="bg-secondary/50 rounded-lg p-6 mb-6 text-left space-y-2 font-body text-sm">
          <p><span className="text-muted-foreground">Zimmer:</span> <strong>{roomTitle}</strong></p>
          <p><span className="text-muted-foreground">Anreise:</span> <strong>{bookingDetails.check_in}</strong></p>
          <p><span className="text-muted-foreground">Abreise:</span> <strong>{bookingDetails.check_out}</strong></p>
          <p><span className="text-muted-foreground">Nächte:</span> <strong>{bookingDetails.nights}</strong></p>
          <p><span className="text-muted-foreground">Gesamtpreis:</span> <strong>€{bookingDetails.totalPrice}</strong></p>
          <div className="pt-2 border-t border-border mt-3">
            <p className="flex items-center gap-1.5 text-accent font-medium">
              <CreditCard size={14} /> Zahlung vor Ort beim Check-in
            </p>
          </div>
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
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        {activeSteps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
              currentIndex >= i
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className={cn(
              "ml-2 text-xs font-body hidden sm:inline transition-colors",
              currentIndex >= i ? "text-foreground" : "text-muted-foreground"
            )}>
              {stepLabels[s]}
            </span>
            {i < activeSteps.length - 1 && (
              <div className={cn(
                "flex-1 h-px mx-3 transition-colors",
                currentIndex > i ? "bg-accent" : "bg-border"
              )} />
            )}
          </div>
        ))}
      </div>

      {isSandboxMode && (
        <div className="bg-accent/10 border border-accent/30 rounded-md p-3 mb-4">
          <p className="text-sm font-body text-accent">Sandmodus aktiv: Buchungen werden als Test gespeichert.</p>
        </div>
      )}

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

          {/* ── Step 1: Dates ── */}
          <AnimatePresence mode="wait">
            {step === "dates" && (
              <motion.div
                key="dates"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
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

                {nights > 0 && (
                  <div className="bg-secondary/50 rounded-md p-4 flex justify-between items-center font-body">
                    <span className="text-sm text-muted-foreground">{nights} {nights === 1 ? "Nacht" : "Nächte"} × €{pricePerNight}</span>
                    <span className="font-display text-xl font-bold text-foreground">€{totalPrice}</span>
                  </div>
                )}

                <Button type="button" variant="hero" className="w-full" size="lg" onClick={goNext}>
                  Weiter <ArrowRight size={16} />
                </Button>
              </motion.div>
            )}

            {/* ── Step 2: Personal details ── */}
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="guest_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <User size={14} /> Name
                        </FormLabel>
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

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" size="lg" onClick={goBack}>
                    <ArrowLeft size={16} /> Zurück
                  </Button>
                  <Button type="button" variant="hero" className="flex-1" size="lg" onClick={goNext}>
                    Weiter <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── Step 3: Summary & confirm ── */}
            {(step === "summary" || step === "checking") && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <h3 className="font-display text-lg font-semibold text-foreground">Buchungsübersicht</h3>

                <div className="bg-secondary/50 rounded-lg p-5 space-y-3 font-body text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Apartment</span>
                    <span className="font-semibold">{roomTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anreise</span>
                    <span className="font-semibold">{checkIn ? format(checkIn, "dd.MM.yyyy", { locale: de }) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Abreise</span>
                    <span className="font-semibold">{checkOut ? format(checkOut, "dd.MM.yyyy", { locale: de }) : "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gäste</span>
                    <span className="font-semibold">{form.getValues("guests_count")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gast</span>
                    <span className="font-semibold">{form.getValues("guest_name")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">E-Mail</span>
                    <span className="font-semibold">{form.getValues("guest_email")}</span>
                  </div>
                  {form.getValues("guest_phone") && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telefon</span>
                      <span className="font-semibold">{form.getValues("guest_phone")}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{nights} {nights === 1 ? "Nacht" : "Nächte"} × €{pricePerNight}</span>
                      <span className="font-display text-2xl font-bold text-foreground">€{totalPrice}</span>
                    </div>
                  </div>
                </div>

                {/* Payment info */}
                <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 font-display font-semibold text-foreground">
                    <CreditCard size={16} className="text-accent" />
                    Zahlung vor Ort
                  </div>
                  <p className="text-xs font-body text-muted-foreground">
                    Die Zahlung erfolgt bequem beim Check-in — bar oder per Karte. Keine Vorauszahlung nötig.
                  </p>
                </div>

                {/* Trust badges */}
                <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                  <span className="flex items-center gap-1"><Shield size={12} className="text-accent" /> Kostenlose Stornierung bis 48h</span>
                  <span className="flex items-center gap-1"><Clock size={12} className="text-accent" /> Sofortige Bestätigung</span>
                  <span className="flex items-center gap-1"><MapPin size={12} className="text-accent" /> Zentrale Lage</span>
                </div>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" size="lg" onClick={goBack} disabled={step === "checking"}>
                    <ArrowLeft size={16} /> Zurück
                  </Button>
                  <Button
                    type="submit"
                    variant="hero"
                    className="flex-1"
                    size="lg"
                    disabled={step === "checking"}
                  >
                    {step === "checking" ? (
                      <><Loader2 className="animate-spin" size={16} /> Wird geprüft...</>
                    ) : (
                      "Jetzt verbindlich buchen"
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center font-body">
                  Mit der Buchung akzeptieren Sie unsere Stornierungsbedingungen.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </Form>
    </motion.div>
  );
};

export default BookingForm;
