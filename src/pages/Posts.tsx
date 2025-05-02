/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PostCard from "@/components/PostCard";

type Post = {
  id: string;
  description: string;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
};

const postsArray = [
  {

    id: "1",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    file_url: "https://example.com/test.jpg",
    file_name: "test.jpg",
    created_at: "2021-01-01",
  },
  {
    id: "2",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    file_url: "https://example.com/test.jpg",
    file_name: "test.jpg",
    created_at: "2021-01-01",
  },
  {
    id: "3",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    file_url: "https://example.com/test.jpg",
    file_name: "test.jpg",
    created_at: "2021-01-01",
  },
  {
    id: "4",
    description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos.",
    file_url: "https://example.com/test.jpg",
    file_name: "test.jpg",
    created_at: "2021-01-01",
  },
];
const Posts = () => {
  const [description, setDescription] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // // Redirect if not admin
  // useEffect(() => {
  //   if (!isLoading && !isAdmin) {
  //     navigate("/login");
  //   }
  // }, [isAdmin, isLoading, navigate]);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPosts(data || []);
      } catch (error: any) {
        console.error("Error fetching posts:", error);
        toast({
          title: "Error loading posts",
          description: error.message || "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAdmin) {
      fetchPosts();
    }
  }, [isAdmin]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (!user || !isAdmin) return;

    setIsSubmitting(true);
    try {
      let fileUrl = null;
      let displayFileName = null;

      // Upload file if exists
      if (file) {
        const fileExt = file.name.split('.').pop();
        const uniqueFileName = `${Math.random()}.${fileExt}`;
        const filePath = uniqueFileName;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("post_attachments")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("post_attachments")
          .getPublicUrl(filePath);

        fileUrl = urlData.publicUrl;
        displayFileName = file.name;
      }

      // Insert post
      const { error: insertError } = await supabase.from("posts").insert([
        {
          description,
          file_url: fileUrl,
          file_name: displayFileName,
          admin_id: user.id,
        },
      ]);

      if (insertError) {
        throw insertError;
      }

      // Refresh posts
      const { data: newPosts, error: fetchError } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setPosts(newPosts || []);
      setDescription("");
      setFile(null);
      
      toast({
        title: "Post submitted successfully",
      });
    } catch (error: any) {
      console.error("Error submitting post:", error);
      toast({
        title: "Error submitting post",
        description: error.message || "Failed to submit post",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Post Management</h1>

      {/* Post Submission Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter post description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Attachment (Optional)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Post"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Posts List */}
      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      {postsArray.length === 0 ? (
        <div className="text-center text-gray-500">No posts yet</div>
      ) : (
        <div className="space-y-4">
          {postsArray.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
