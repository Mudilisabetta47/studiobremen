
-- Add user_id to bookings so logged-in guests can view their history
ALTER TABLE public.bookings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Policy: logged-in users can view their own bookings
CREATE POLICY "Users can view own bookings"
ON public.bookings
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: logged-in users can create bookings linked to themselves
CREATE POLICY "Authenticated users can create own bookings"
ON public.bookings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND guest_name IS NOT NULL
  AND guest_email IS NOT NULL
  AND check_in >= CURRENT_DATE
  AND status = 'pending'::booking_status
);
