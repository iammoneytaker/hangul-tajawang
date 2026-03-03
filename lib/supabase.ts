import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
  // --- Auth ---
  static async signInWithKakao() {
    const SCOPES = 'account_email profile_nickname profile_image';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scopes: SCOPES,
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        queryParams: { prompt: 'login' }
      },
    });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    await supabase.auth.signOut();
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // --- Profiles ---
  static async getMyProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
  }

  static async updateProfile(updates: { nickname?: string; avatar_url?: string }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const { error } = await supabase.from('profiles').update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);
    if (error) throw error;
  }
// --- Results ---
static async saveResult(contentId: string, speed: number, accuracy: number, elapsedSeconds: number) {
  const user = await this.getCurrentUser();
  if (!user) return;

  try {
    // 1. 결과 저장
    await supabase.from('typing_results').insert({
      user_id: user.id,
      content_id: contentId,
      speed: speed,
      accuracy: accuracy,
      elapsed_seconds: elapsedSeconds,
    });

    // 2. 최고 기록 갱신 (명시적 비교 및 업데이트)
    const { data: profile } = await supabase.from('profiles').select('best_speed').eq('id', user.id).single();
    const currentBest = profile?.best_speed || 0;

    if (speed > currentBest) {
      await supabase.from('profiles').update({
        best_speed: speed,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      console.log(`최고 타수 갱신 완료: ${currentBest} -> ${speed}`);
    }
  } catch (error) {
    console.error("기록 저장 중 오류:", error);
  }
}

  static async getMyResults() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('typing_results')
      .select('*, typing_contents(title)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getRankings(contentId: string) {
    const { data, error } = await supabase
      .from('typing_results')
      .select('*, profiles!typing_results_user_id_fkey(nickname, avatar_url)')
      .eq('content_id', contentId)
      .order('speed', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data;
  }

  // --- UGC Contents ---
  static async getContents(category?: string, sortBy: '인기순' | '최신순' = '인기순') {
    let query = supabase.from('typing_contents').select(`
      *,
      profiles!typing_contents_author_id_fkey(nickname, avatar_url),
      typing_results(user_id),
      typing_comments(id)
    `).lt('report_count', 10);

    if (category && category !== '전체') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;

    const processed = data.map((item: any) => ({
      ...item,
      unique_complete_count: new Set(item.typing_results?.map((r: any) => r.user_id)).size,
      comment_count: item.typing_comments?.length || 0
    }));

    if (sortBy === '인기순') {
      return processed.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    }
    return processed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getMyContents() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('typing_contents')
      .select('*, typing_results(user_id), typing_comments(id)')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      unique_complete_count: new Set(item.typing_results?.map((r: any) => r.user_id)).size,
      comment_count: item.typing_comments?.length || 0
    }));
  }

  static async getLikedContents() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase
      .from('likes')
      .select('typing_contents(*, profiles!typing_contents_author_id_fkey(nickname, avatar_url), typing_results(user_id), typing_comments(id))')
      .eq('user_id', user.id);
    if (error) throw error;
    
    return data.map((item: any) => {
      const content = item.typing_contents;
      return {
        ...content,
        unique_complete_count: new Set(content.typing_results?.map((r: any) => r.user_id)).size,
        comment_count: content.typing_comments?.length || 0
      };
    });
  }

  static async createContent(title: string, content: string, category: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase.from('typing_contents').insert({
      author_id: user.id,
      title,
      content,
      category,
    });
    if (error) throw error;
  }

  static async updateContent(contentId: string, title: string, content: string, category: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    const { error } = await supabase.from('typing_contents')
      .update({ title, content, category })
      .eq('id', contentId)
      .eq('author_id', user.id);
    if (error) throw error;
  }

  static async deleteContent(contentId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    // Cascade delete should handle likes/comments/results if configured, 
    // but manually deleting for safety if needed.
    const { error } = await supabase.from('typing_contents').delete().eq('id', contentId).eq('author_id', user.id);
    if (error) throw error;
  }

  // --- Likes ---
  static async toggleLike(contentId: string, isCurrentlyLiked: boolean, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) return;

    try {
      if (isCurrentlyLiked) {
        await supabase.from('likes').delete().match({ user_id: user.id, content_id: contentId });
      } else {
        await supabase.from('likes').insert({ user_id: user.id, content_id: contentId });
        if (user.id !== authorId) {
          await supabase.from('typing_activities').insert({
            receiver_id: authorId,
            actor_id: user.id,
            type: 'like',
            content_id: contentId
          });
        }
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류:", error);
    }
  }

  // --- Comments ---
  static async addComment(contentId: string, comment: string, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    const { error } = await supabase.from('typing_comments').insert({
      content_id: contentId,
      user_id: user.id,
      comment: comment
    });
    if (error) throw error;

    if (user.id !== authorId) {
      await supabase.from('typing_activities').insert({
        receiver_id: authorId,
        actor_id: user.id,
        type: 'comment',
        content_id: contentId
      });
    }
  }

  static async deleteComment(commentId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    const { error } = await supabase.from('typing_comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (error) throw error;
  }

  static async reportContent(contentId: string) {
    // RPC increment_counter usage matches DB definition
    await supabase.rpc('increment_counter', {
      t_name: 'typing_contents',
      c_name: 'report_count',
      row_id: contentId
    });
  }

  // --- Feedback ---
  static async sendFeedback(email: string, message: string) {
    await supabase.from('feedbacks').insert({
      email: email || '익명',
      message: message,
    });
  }
}
