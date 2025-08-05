import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  Send, 
  User,
  Briefcase,
  TrendingUp,
  Lightbulb,
  UserCircle
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SocialFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [postType, setPostType] = useState("update");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockPosts = [
      {
        id: 1,
        author: {
          name: "Sarah Chen",
          
          role: "Senior Frontend Developer"
        },
        content: "Just completed a major React project using TypeScript and Tailwind CSS. The performance improvements are incredible! 🚀 #React #TypeScript #WebDev",
        type: "achievement",
        likes: 24,
        comments: 8,
        shares: 3,
        timestamp: "2 hours ago",
        tags: ["React", "TypeScript", "WebDev"]
      },
      {
        id: 2,
        author: {
          name: "Mike Rodriguez",
          
          role: "Tech Lead"
        },
        content: "Looking for experienced Node.js developers to join our team. We're building scalable microservices and need someone who loves clean code and testing. DM me if interested!",
        type: "hiring",
        likes: 15,
        comments: 12,
        shares: 5,
        timestamp: "4 hours ago",
        tags: ["Node.js", "Microservices", "Hiring"]
      },
      {
        id: 3,
        author: {
          name: "Emma Watson",
          
          role: "UX Designer"
        },
        content: "Pro tip: Always start with user research before diving into design. Understanding your users' pain points will save you hours of iteration later. What's your design process?",
        type: "advice",
        likes: 31,
        comments: 15,
        shares: 7,
        timestamp: "6 hours ago",
        tags: ["UX", "Design", "UserResearch"]
      },
      {
        id: 4,
        author: {
          name: "David Kim",
          
          role: "Full Stack Developer"
        },
        content: "Started learning Solana development today. The Rust ecosystem is fascinating! Anyone else exploring Web3 development?",
        type: "learning",
        likes: 18,
        comments: 9,
        shares: 4,
        timestamp: "8 hours ago",
        tags: ["Solana", "Web3", "Rust"]
      }
    ];
    setPosts(mockPosts);
  }, []);

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newPostObj = {
        id: Date.now(),
        author: {
          name: user?.name || "Anonymous",
          
          role: user?.role || "User"
        },
        content: newPost,
        type: postType,
        likes: 0,
        comments: 0,
        shares: 0,
        timestamp: "Just now",
        tags: extractTags(newPost)
      };

      setPosts([newPostObj, ...posts]);
      setNewPost("");
      setIsSubmitting(false);
    }, 1000);
  };

  const extractTags = (text) => {
    const hashtags = text.match(/#\w+/g);
    return hashtags ? hashtags.map(tag => tag.slice(1)) : [];
  };

  const getPostIcon = (type) => {
    switch (type) {
      case "achievement": return <TrendingUp className="w-4 h-4" />;
      case "hiring": return <Briefcase className="w-4 h-4" />;
      case "advice": return <Lightbulb className="w-4 h-4" />;
      case "learning": return <User className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPostColor = (type) => {
    switch (type) {
      case "achievement": return "bg-green-100 text-green-800";
      case "hiring": return "bg-blue-100 text-blue-800";
      case "advice": return "bg-yellow-100 text-yellow-800";
      case "learning": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Career Feed</h1>
        <p className="text-gray-600">Share updates, advice, and connect with the community</p>
      </div>

      {/* Create Post */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Create a Post
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div className="flex gap-2">
              <Button
                type="button"
                variant={postType === "update" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("update")}
              >
                Update
              </Button>
              <Button
                type="button"
                variant={postType === "achievement" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("achievement")}
              >
                Achievement
              </Button>
              <Button
                type="button"
                variant={postType === "advice" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("advice")}
              >
                Advice
              </Button>
              <Button
                type="button"
                variant={postType === "hiring" ? "default" : "outline"}
                size="sm"
                onClick={() => setPostType("hiring")}
              >
                Hiring
              </Button>
            </div>

            <Textarea
              placeholder="Share your thoughts, achievements, or advice with the community..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              rows={4}
              className="resize-none"
            />

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Use #hashtags to make your post discoverable
              </p>
              <Button type="submit" disabled={isSubmitting || !newPost.trim()}>
                {isSubmitting ? (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full">
                  <UserCircle className="w-8 h-8 text-gray-600" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">{post.author.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {post.author.role}
                    </Badge>
                    <Badge className={`text-xs ${getPostColor(post.type)}`}>
                      {getPostIcon(post.type)}
                      {post.type}
                    </Badge>
                  </div>

                  <p className="text-gray-600 mb-3">{post.content}</p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{post.timestamp}</span>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 hover:text-blue-600">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-green-600">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                      <button className="flex items-center gap-1 hover:text-purple-600">
                        <Share2 className="w-4 h-4" />
                        {post.shares}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {posts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-600">Be the first to share something with the community!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SocialFeed;
