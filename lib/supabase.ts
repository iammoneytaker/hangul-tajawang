import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SortType = '최신순' | '인기순' | '댓글순' | '도전순';

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

  static async getAuthorProfile(authorId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', authorId).single();
    if (error) throw error;
    return data;
  }

  static async updateProfile(updates: { nickname?: string; avatar_url?: string; best_speed?: number }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const { error } = await supabase.from('profiles').update({
      ...updates,
      updated_at: new Date().toISOString()
    }).eq('id', user.id);
    if (error) throw error;
  }

  static async updatePrivacyConsent() {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const { error } = await supabase.from('profiles').update({
      privacy_policy_accepted: true,
      privacy_policy_accepted_at: new Date().toISOString()
    }).eq('id', user.id);
    
    if (error) throw error;
  }

  // --- Results & 도전하기 ---
  static async saveResult(contentId: string, speed: number, accuracy: number, elapsedSeconds: number) {
    const user = await this.getCurrentUser();
    if (!user) return;

    try {
      // 1. 결과 기록 저장 (도전 내역)
      await supabase.from('typing_results').insert({
        user_id: user.id,
        content_id: contentId,
        speed: speed,
        accuracy: accuracy,
        elapsed_seconds: elapsedSeconds,
      });

      // 2. 해당 콘텐츠의 도전 횟수(complete_count) 증가 (RPC 호출)
      await supabase.rpc('increment_counter', {
        t_name: 'typing_contents',
        c_name: 'complete_count',
        row_id: contentId
      });

      // 3. 내 프로필의 최고 타수 업데이트
      const { data: profile } = await supabase.from('profiles').select('best_speed').eq('id', user.id).single();
      const currentBest = profile?.best_speed || 0;

      if (speed > currentBest) {
        await this.updateProfile({ best_speed: speed });
      }
    } catch (error) {
      console.error("도전 기록 저장 중 오류:", error);
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
  static async getContents(category?: string, sortBy: SortType = '최신순') {
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
      comment_count: item.typing_comments?.length || 0,
      unique_participant_count: new Set(item.typing_results?.map((r: any) => r.user_id)).size
    }));

    if (sortBy === '인기순') return processed.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    if (sortBy === '도전순') return processed.sort((a, b) => (b.complete_count || 0) - (a.complete_count || 0));
    if (sortBy === '댓글순') return processed.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
    return processed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getContentById(contentId: string) {
    const { data, error } = await supabase
      .from('typing_contents')
      .select(`
        *,
        profiles!typing_contents_author_id_fkey(nickname, avatar_url, best_speed),
        typing_results(user_id, speed, accuracy, created_at),
        typing_comments(*, profiles(nickname, avatar_url))
      `)
      .eq('id', contentId)
      .single();
      
    if (error) throw error;
    
    return {
      ...data,
      comment_count: data.typing_comments?.length || 0,
      unique_participant_count: new Set(data.typing_results?.map((r: any) => r.user_id)).size
    };
  }

  static async incrementViewCount(contentId: string) {
    await supabase.rpc('increment_counter', {
      t_name: 'typing_contents',
      c_name: 'web_view_count',
      row_id: contentId
    });
  }

  static async getAuthorContents(authorId: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('typing_contents')
      .select('*, typing_results(user_id), typing_comments(id)')
      .eq('author_id', authorId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    
    return data.map((item: any) => ({
      ...item,
      comment_count: item.typing_comments?.length || 0
    }));
  }

  static async getRelatedContents(authorId: string, currentContentId: string) {
    // 1. 같은 작가의 다른 글 3개
    const { data: authorOther } = await supabase
      .from('typing_contents')
      .select('id, title, category, complete_count, like_count')
      .eq('author_id', authorId)
      .neq('id', currentContentId)
      .order('created_at', { ascending: false })
      .limit(3);

    // 2. 전체 인기 글 3개
    const { data: popular } = await supabase
      .from('typing_contents')
      .select('id, title, category, complete_count, like_count')
      .neq('id', currentContentId)
      .order('complete_count', { ascending: false })
      .limit(3);

    return { authorOther: authorOther || [], popular: popular || [] };
  }

  // --- Likes ---
  static async toggleLike(contentId: string, isCurrentlyLiked: boolean, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    try {
      if (isCurrentlyLiked) {
        // 1. 좋아요 테이블에서 삭제
        await supabase.from('likes').delete().match({ user_id: user.id, content_id: contentId });
        
        // 2. 카운트 감소 (-1)
        await supabase.rpc('sync_like_count', {
          content_id: contentId,
          delta: -1
        });
      } else {
        // 1. 좋아요 테이블에 추가
        await supabase.from('likes').insert({ user_id: user.id, content_id: contentId });
        
        // 2. 카운트 증가 (+1)
        await supabase.rpc('sync_like_count', {
          content_id: contentId,
          delta: 1
        });

        // 3. 알림(Activity) 생성 (본인 글이 아닐 때만)
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
      console.error("좋아요 처리 오류:", error);
      throw error;
    }
  }

  // --- Comments ---
  static async addComment(contentId: string, comment: string, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    // 1. 댓글 추가
    const { error } = await supabase.from('typing_comments').insert({
      content_id: contentId,
      user_id: user.id,
      comment: comment
    });
    if (error) throw error;

    // 2. 알림 생성
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
    await supabase.rpc('increment_counter', {
      t_name: 'typing_contents',
      c_name: 'report_count',
      row_id: contentId
    });
  }

  // --- 알림 (Activities) ---
  static async getActivities() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('typing_activities')
      .select(`
        *,
        actor:profiles!typing_activities_actor_id_fkey(nickname, avatar_url),
        content:typing_contents(title)
      `)
      .eq('receiver_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);
      
    if (error) throw error;
    return data;
  }

  static async getUnreadActivityCount() {
    const user = await this.getCurrentUser();
    if (!user) return 0;
    
    const { count, error } = await supabase
      .from('typing_activities')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
      
    if (error) return 0;
    return count || 0;
  }

  static async markActivitiesAsRead() {
    const user = await this.getCurrentUser();
    if (!user) return;
    
    await supabase
      .from('typing_activities')
      .update({ is_read: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false);
  }
}
