import { motion } from "framer-motion";
import { Bed, Bath, ConciergeBell, Wifi, Tv, Wind, Coffee, ShieldCheck } from "lucide-react";

interface AmenityGroupsProps {
  amenities: string[];
}

const iconMap: Record<string, React.ElementType> = {
  "Bett": Bed, "King-Size-Bett": Bed, "Doppelbett": Bed,
  "Regendusche": Bath, "Badewanne": Bath, "Freistehende Badewanne": Bath,
  "WLAN": Wifi, "Smart-TV": Tv, "Klimaanlage": Wind,
  "Nespresso": Coffee, "Minibar": Coffee, "Safe": ShieldCheck,
};

const groups = [
  { label: "Schlafzimmer", icon: Bed, keywords: ["Bett", "Bademantel", "Pantoffeln", "Bettwäsche"] },
  { label: "Badezimmer", icon: Bath, keywords: ["Dusche", "Regendusche", "Badewanne", "Bad"] },
  { label: "Wohnbereich", icon: Tv, keywords: ["TV", "Smart-TV", "Wohnbereich", "Schreibtisch", "Küche", "Geschirrspüler", "Waschmaschine"] },
  { label: "Service & Komfort", icon: ConciergeBell, keywords: ["WLAN", "Minibar", "Nespresso", "Klimaanlage", "Safe"] },
];

const AmenityGroups = ({ amenities }: AmenityGroupsProps) => {
  const categorized = groups.map((group) => ({
    ...group,
    items: amenities.filter((a) =>
      group.keywords.some((kw) => a.toLowerCase().includes(kw.toLowerCase()))
    ),
  })).filter((g) => g.items.length > 0);

  // Catch uncategorized
  const allCategorized = categorized.flatMap((g) => g.items);
  const uncategorized = amenities.filter((a) => !allCategorized.includes(a));
  if (uncategorized.length > 0) {
    categorized.push({ label: "Weitere Annehmlichkeiten", icon: ConciergeBell, items: uncategorized, keywords: [] });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {categorized.map((group, gi) => {
        const GroupIcon = group.icon;
        return (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: gi * 0.1 }}
            className="bg-card border border-border rounded-lg p-5"
          >
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                <GroupIcon size={16} className="text-accent" />
              </div>
              <h4 className="font-display text-sm font-semibold tracking-wide">{group.label}</h4>
            </div>
            <ul className="space-y-1.5">
              {group.items.map((item) => {
                const ItemIcon = iconMap[item] || ConciergeBell;
                return (
                  <li key={item} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <ItemIcon size={13} className="text-accent/70 shrink-0" />
                    {item}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AmenityGroups;
