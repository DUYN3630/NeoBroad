import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/axios';
import { useToastStore } from '@/components/ToastNotification';
import { signalRService } from '@/lib/signalrService';
import { 
  Heart, 
  MessageSquare, 
  Trash2, 
  Send, 
  Image as ImageIcon, 
  User, 
  Clock, 
  Share2, 
  FileText,
  AlertCircle,
  Upload
} from 'lucide-react';

interface Comment {
  id: string;
  authorName: string;
  authorRole: number;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: number;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  comments: Comment[];
}

const PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1597872200319-380d925034df?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80'
];

const TimelineManagementPage = () => {
  const { user } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Post Form
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Comments state per post
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.src = reader.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const max_width = 1024;
          const max_height = 768;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > max_width) {
              height *= max_width / width;
              width = max_width;
            }
          } else {
            if (height > max_height) {
              width *= max_height / height;
              height = max_height;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Compress to JPEG with 0.7 quality factor
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            setSelectedImage(compressedBase64);
            setCustomImageUrl('');
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response: any = await apiClient.get('/Timeline');
      setPosts(response.data);
    } catch (error) {
      console.error('Fetch timeline error:', error);
      useToastStore.getState().addToast({
        title: 'Lỗi tải dữ liệu',
        message: 'Không thể kết nối đến máy chủ để tải bảng tin.',
        type: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();

    const unsubscribeNewPost = signalRService.subscribe('ReceiveTimelinePost', (newPost) => {
      const formattedPost = {
        ...newPost,
        comments: newPost.comments || []
      };
      setPosts(prev => {
        if (prev.some(p => p.id === formattedPost.id)) return prev;
        return [formattedPost, ...prev];
      });
    });

    return () => {
      unsubscribeNewPost();
    };
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const imageUrl = selectedImage || (customImageUrl.trim() ? customImageUrl.trim() : null);
      
      await apiClient.post('/Timeline', {
        authorId: user.id,
        content: content,
        imageUrl: imageUrl
      });

      useToastStore.getState().addToast({
        title: '🎉 Đăng bài thành công',
        message: 'Bài viết mới đã được cập nhật lên bảng tin hệ thống.',
        type: 'success'
      });

      setContent('');
      setSelectedImage(null);
      setCustomImageUrl('');
      setShowImageSelector(false);
      fetchPosts();
    } catch (error: any) {
      console.error('Create post error:', error);
      if (error.response?.data) {
        console.error('Create post error details (stringified):', JSON.stringify(error.response.data, null, 2));
      }
      useToastStore.getState().addToast({
        title: 'Lỗi đăng bài',
        message: error.response?.data?.error || error.response?.data?.message || 'Không thể tạo bài viết mới. Vui lòng thử lại sau.',
        type: 'danger'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const response: any = await apiClient.post(`/Timeline/${postId}/like`);
      setPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? { ...p, likeCount: response.data.likes } : p)
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleCommentSubmit = async (postId: string) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim() || !user) return;

    try {
      const response: any = await apiClient.post(`/Timeline/${postId}/comments`, {
        authorId: user.id,
        content: commentText
      });

      // Update post list in state
      setPosts(prevPosts => 
        prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              commentCount: p.commentCount + 1,
              comments: [...p.comments, response.data.comment]
            };
          }
          return p;
        })
      );

      // Reset input
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Comment error:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) return;

    try {
      await apiClient.delete(`/Timeline/${postId}`);
      useToastStore.getState().addToast({
        title: 'Đã xóa bài viết',
        message: 'Bài viết đã được gỡ bỏ khỏi bảng tin.',
        type: 'success'
      });
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (error) {
      console.error('Delete post error:', error);
    }
  };

  const getRoleBadge = (role: number) => {
    switch (role) {
      case 0:
        return <span className="bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Admin</span>;
      case 1:
        return <span className="bg-blue-50 text-blue-600 border border-blue-100 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Staff</span>;
      default:
        return <span className="bg-gray-50 text-gray-500 border border-gray-150 text-[8px] font-black uppercase px-2 py-0.5 rounded-full shrink-0">Student</span>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">NeoBoard - Bảng tin Timeline</h2>
        <p className="text-xs text-gray-400 mt-1">Đăng tải tin tức công nghệ, cẩm nang phòng máy, quy trình thực hành cho toàn bộ sinh viên và giảng viên.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Create Post */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm sticky top-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-4 flex items-center">
              <FileText size={16} className="mr-2 text-blue-600" /> Tạo bài viết mới
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <textarea
                  rows={5}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-2xl text-xs outline-none transition-all resize-none"
                  placeholder="Hôm nay có cập nhật gì mới về phòng máy, cẩm nang hay mẹo kỹ thuật nào không?..."
                />
              </div>

              {/* Cover Image Selector */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowImageSelector(!showImageSelector)}
                  className="flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <ImageIcon size={14} />
                  <span>{selectedImage ? 'Thay đổi ảnh bìa' : 'Thêm ảnh bìa bài viết'}</span>
                </button>

                {showImageSelector && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-2xl border border-gray-200/50 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Chọn ảnh mẫu có sẵn</span>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {PRESET_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedImage(img);
                            setCustomImageUrl('');
                          }}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                            selectedImage === img ? 'border-blue-600 scale-95 shadow-md' : 'border-transparent hover:scale-95'
                          }`}
                        >
                          <img src={img} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-gray-200/50 pt-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-2">Hoặc tải ảnh lên từ thiết bị</span>
                      <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-white hover:bg-gray-100/75 text-gray-700 border border-dashed border-gray-300 rounded-xl text-xs font-bold cursor-pointer transition-colors">
                        <Upload size={14} className="text-blue-600 animate-pulse" />
                        <span>Chọn ảnh để tải lên...</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLocalImageUpload}
                        />
                      </label>
                    </div>

                    <div className="border-t border-gray-200/50 pt-3">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider block mb-1">Hoặc đường dẫn ảnh của bạn</span>
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={customImageUrl}
                        onChange={e => {
                          setCustomImageUrl(e.target.value);
                          setSelectedImage(null);
                        }}
                        className="w-full px-3 py-2 bg-white border border-gray-200 focus:border-blue-500 rounded-xl text-[11px] outline-none transition-all"
                      />
                    </div>

                    {(selectedImage || customImageUrl) && (
                      <div className="relative w-full h-24 rounded-xl overflow-hidden border border-gray-200 mt-2">
                        <img 
                          src={selectedImage || customImageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setCustomImageUrl('');
                          }}
                          className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-5 rounded-2xl flex items-center justify-center uppercase text-xs tracking-wider shadow-md transition-all active:scale-[0.98]"
              >
                {submitting ? 'Đang gửi bài...' : 'Đăng lên bảng tin'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Timeline Feed */}
        <div className="lg:col-span-7 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-gray-400 italic text-xs">Đang tải các bài viết...</div>
          ) : posts.length > 0 ? (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden hover:shadow-md transition-all">
                  {/* Image cover if exists */}
                  {post.imageUrl && (
                    <div className="h-48 w-full overflow-hidden">
                      <img src={post.imageUrl} alt="Cover" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Header: Author & Time */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-200">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-900 text-xs">{post.authorName}</span>
                            {getRoleBadge(post.authorRole)}
                          </div>
                          <div className="flex items-center text-[10px] text-gray-400 font-bold mt-0.5 space-x-1">
                            <Clock size={10} />
                            <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')} {new Date(post.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete option if admin/staff or post author */}
                      {(user?.role === 0 || user?.id === post.authorId) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-gray-50 rounded-full transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {/* Content */}
                    <p className="text-xs text-gray-700 whitespace-pre-line leading-relaxed">{post.content}</p>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1.5 text-gray-400 hover:text-red-500 font-bold transition-all"
                        >
                          <Heart size={14} className={post.likeCount > 0 ? 'text-red-500 fill-red-500' : ''} />
                          <span>{post.likeCount} Thích</span>
                        </button>
                        <button
                          onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                          className="flex items-center space-x-1.5 text-gray-400 hover:text-blue-500 font-bold transition-all"
                        >
                          <MessageSquare size={14} />
                          <span>{post.commentCount} Bình luận</span>
                        </button>
                      </div>
                      
                      <button className="flex items-center space-x-1 text-gray-400 hover:text-gray-600 font-bold transition-all">
                        <Share2 size={13} />
                        <span>Chia sẻ</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {activeCommentsPostId === post.id && (
                      <div className="border-t border-gray-100 pt-4 space-y-4 animate-in slide-in-from-top-3 duration-200">
                        {/* Comment Input */}
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={commentInputs[post.id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleCommentSubmit(post.id);
                            }}
                            className="flex-grow px-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 rounded-xl text-xs outline-none transition-all"
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            className="bg-blue-600 text-white rounded-xl p-2 hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                          >
                            <Send size={12} />
                          </button>
                        </div>

                        {/* Comment List */}
                        {post.comments.length > 0 ? (
                          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                            {post.comments.map((comm) => (
                              <div key={comm.id} className="bg-gray-50/70 p-3 rounded-2xl border border-gray-150/50 flex gap-2">
                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0 border border-gray-200">
                                  <User size={10} />
                                </div>
                                <div className="space-y-0.5 flex-grow">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-[11px] text-gray-900 leading-tight">{comm.authorName}</span>
                                    {getRoleBadge(comm.authorRole)}
                                    <span className="text-[8px] text-gray-400 font-bold ml-auto">{new Date(comm.createdAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <p className="text-[11px] text-gray-600 leading-relaxed">{comm.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-gray-400 font-medium italic text-center">Chưa có bình luận nào cho bài viết này.</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-gray-150 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="font-black text-gray-800 uppercase text-xs">Bảng tin trống</p>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Hãy đăng bài viết đầu tiên để bắt đầu truyền thông nội bộ!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimelineManagementPage;
