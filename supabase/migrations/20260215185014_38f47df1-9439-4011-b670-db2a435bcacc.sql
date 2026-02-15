
-- Replace the overly permissive booking insert policy with a more restrictive one
DROP POLICY "Anyone can create bookings" ON public.bookings;

-- Allow anonymous inserts but require essential fields via check constraint
ALTER TABLE public.bookings ADD CONSTRAINT bookings_check_dates CHECK (check_out > check_in);
ALTER TABLE public.bookings ADD CONSTRAINT bookings_check_guests CHECK (guests_count > 0 AND guests_count <= 10);
ALTER TABLE public.bookings ADD CONSTRAINT bookings_check_email CHECK (guest_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Re-create with anon role explicitly (still needed for public booking)
CREATE POLICY "Guests can create bookings"
  ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (
    guest_name IS NOT NULL AND
    guest_email IS NOT NULL AND
    check_in >= CURRENT_DATE AND
    status = 'pending'
  );
