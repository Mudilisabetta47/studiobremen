import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DbRoom = Tables<"rooms"> & {
  primary_image?: string;
};

async function fetchRooms(): Promise<DbRoom[]> {
  const { data: rooms, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw error;

  // Fetch primary images for all rooms
  const roomIds = (rooms ?? []).map((r) => r.id);

  if (roomIds.length === 0) {
    return [];
  }

  const { data: images } = await supabase
    .from("room_images")
    .select("room_id, image_url")
    .in("room_id", roomIds)
    .eq("is_primary", true);

  const imageMap = new Map((images ?? []).map((img) => [img.room_id, img.image_url]));

  return (rooms ?? []).map((room) => ({
    ...room,
    primary_image: imageMap.get(room.id),
  }));
}

export function useRooms() {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: fetchRooms,
  });
}

export function useRoom(slug: string | undefined) {
  return useQuery({
    queryKey: ["room", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const { data: images } = await supabase
        .from("room_images")
        .select("image_url")
        .eq("room_id", data.id)
        .eq("is_primary", true)
        .maybeSingle();

      return { ...data, primary_image: images?.image_url } as DbRoom;
    },
    enabled: !!slug,
  });
}
