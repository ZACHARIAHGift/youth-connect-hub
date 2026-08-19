import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useVisitorId } from "@/hooks/use-visitor-id";
import { supabase } from "@/integrations/supabase/client";
import { compactNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export function LikeButton({
  postId,
  slug,
  likeCount,
}: {
  postId: string;
  slug: string;
  likeCount: number;
}) {
  const visitorId = useVisitorId();
  const queryClient = useQueryClient();

  const liked = useQuery({
    queryKey: ["liked", postId, visitorId],
    enabled: Boolean(visitorId),
    queryFn: async () => {
      const { data } = await supabase
        .from("post_likes")
        .select("id")
        .eq("post_id", postId)
        .eq("visitor_id", visitorId!)
        .maybeSingle();
      return Boolean(data);
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!visitorId) return;
      if (liked.data) {
        const { error } = await supabase
          .from("post_likes")
          .delete()
          .eq("post_id", postId)
          .eq("visitor_id", visitorId);
        if (error) throw new Error(error.message);
        return false;
      }
      const { error } = await supabase
        .from("post_likes")
        .insert({ post_id: postId, visitor_id: visitorId });
      if (error && error.code !== "23505") throw new Error(error.message);
      return true;
    },
    onSuccess: (isLiked) => {
      queryClient.setQueryData(["liked", postId, visitorId], isLiked);
      queryClient.invalidateQueries({ queryKey: ["post", slug] });
      queryClient.invalidateQueries({ queryKey: ["home"] });
      if (isLiked) toast.success("Thanks for the love!");
    },
    onError: () => toast.error("Could not register your like. Please try again."),
  });

  const isLiked = liked.data === true;
  const optimisticCount = likeCount + (isLiked && !toggle.isPending ? 0 : 0);

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      onClick={() => toggle.mutate()}
      disabled={!visitorId || toggle.isPending}
      aria-pressed={isLiked}
    >
      <Heart className={cn("size-4", isLiked && "fill-current")} />
      {compactNumber(optimisticCount)} {isLiked ? "Liked" : "Like"}
    </Button>
  );
}
