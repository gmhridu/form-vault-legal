import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const PostCard = ({post}) => {
  return (
    <Card key={post.id} className="overflow-hidden">
      <CardContent className="p-6">
        <div className="text-sm text-muted-foreground mb-2">
          Posted on {formatDate(post.created_at)}
        </div>
        <p className="text-lg mb-4">{post.description}</p>
        {post.file_url && (
          <div className="mt-4 flex justify-end ">
            <Button asChild variant="link" size="sm">
              <a
                href={post.file_url}
                target="_blank"
                rel="noopener noreferrer"
                download={post.file_name || true}
                className="text-red-500"
              >
                Download
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
