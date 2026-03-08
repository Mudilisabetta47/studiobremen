INSERT INTO public.user_roles (user_id, role) 
VALUES ('f6a2a34c-7dd2-403d-9908-d8b8681a1fdc', 'admin') 
ON CONFLICT (user_id, role) DO NOTHING;