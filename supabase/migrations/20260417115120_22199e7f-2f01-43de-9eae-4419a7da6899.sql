UPDATE public.rooms SET smoobu_iframe_id = CASE slug
  WHEN 'stadtwohnung-nr-2' THEN '2064505'
  WHEN 'city-apartment-no3' THEN '2064505'
  WHEN 'city-apartment-nr-4' THEN '3026151'
  WHEN 'city-apartment-no5' THEN '2483838'
  WHEN 'schlachte-studio-no4' THEN '2139631'
  WHEN 'schlachte-studio-no5' THEN '2351093'
END WHERE slug IN ('stadtwohnung-nr-2','city-apartment-no3','city-apartment-nr-4','city-apartment-no5','schlachte-studio-no4','schlachte-studio-no5');