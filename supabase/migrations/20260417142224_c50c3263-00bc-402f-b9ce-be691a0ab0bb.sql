
-- 1. Tighten booking INSERT policies to require active room
DROP POLICY IF EXISTS "Guests can create bookings" ON public.bookings;
CREATE POLICY "Guests can create bookings"
  ON public.bookings
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    guest_name IS NOT NULL
    AND guest_email IS NOT NULL
    AND check_in >= CURRENT_DATE
    AND status = 'pending'::booking_status
    AND EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND is_active = true)
  );

DROP POLICY IF EXISTS "Authenticated users can create own bookings" ON public.bookings;
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
    AND EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND is_active = true)
  );

-- 2. Add explicit admin-only UPDATE policy on storage.objects for room-images bucket
DROP POLICY IF EXISTS "Admins can update room images" ON storage.objects;
CREATE POLICY "Admins can update room images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (bucket_id = 'room-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
