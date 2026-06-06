import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import MediaCard from "@/components/MediaCard";
import { useMedia, type Media } from "@/hooks/useMedia";

interface Props {
  current: Media;
}

const SuggestionsSection = ({ current }: Props) => {
  const navigate = useNavigate();
  const { data: all = [] } = useMedia();

  if (!all.length) return null;

  const sameCategory = all.filter(
    (m) => m.id !== current.id && m.category === current.category,
  );
  const sameType = all.filter(
    (m) => m.id !== current.id && m.type === current.type && !sameCategory.find((x) => x.id === m.id),
  );
  const others = all.filter(
    (m) => m.id !== current.id && !sameCategory.find((x) => x.id === m.id) && !sameType.find((x) => x.id === m.id),
  );

  const list = [...sameCategory, ...sameType, ...others].slice(0, 10);
  if (!list.length) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="w-1 h-6 rounded-full bg-primary" />
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl text-foreground tracking-wide">YOU MIGHT ALSO LIKE</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {list.map((m, i) => (
          <MediaCard key={m.id} item={m} index={i} onClick={() => navigate(`/watch/${m.id}`)} />
        ))}
      </div>
    </section>
  );
};

export default SuggestionsSection;
