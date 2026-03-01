import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export class SupabaseService {
  // --- Auth ---
  static async signInWithKakao() {
    console.log("로그인 시도 시작: Supabase OAuth (Kakao)");
    const SCOPES = 'account_email profile_nickname profile_image';
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scopes: SCOPES,
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/` : undefined,
        // 강제로 카카오 로그인 창(아이디/비번 입력)을 띄우고 싶을 때 추가
        queryParams: {
          prompt: 'login'
        }
      },
    });

    if (error) {
      console.error("Supabase OAuth 에러 발생:", error);
      throw error;
    }
    return data;
  }

  // 앱(Flutter)과 동일한 토큰 방식 (필요시 사용)
  static async signInWithKakaoToken(idToken: string, accessToken: string) {
    console.log("토큰 방식 로그인 시도...");
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'kakao',
      token: idToken,
      access_token: accessToken,
    });
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) return null;
    return user;
  }

  // --- Profiles ---
  static async getMyProfile() {
    const user = await this.getCurrentUser();
    if (!user) return null;
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error) return null;
    return data;
  }

  static async updateProfile(updates: { nickname?: string; avatar_url?: string; best_speed?: number }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      ...updates,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
  }

  // --- UGC Contents ---
  static async getContents(category?: string, sortBy: '인기순' | '최신순' = '인기순') {
    let query = supabase.from('typing_contents').select(`
      *,
      profiles!typing_contents_author_id_fkey(nickname, avatar_url),
      typing_results(user_id)
    `).lt('report_count', 10);

    if (category && category !== '전체') {
      query = query.eq('category', category);
    }

    if (sortBy === '인기순') {
      query = query.order('like_count', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;
    if (error) throw error;

    return data.map((item: any) => {
      const results = item.typing_results || [];
      const uniqueUsers = new Set(results.map((r: any) => r.user_id)).size;
      return {
        ...item,
        unique_complete_count: uniqueUsers,
      };
    });
  }

  static async createContent(title: string, content: string, category: string, tags: string[] = []) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase.from('typing_contents').insert({
      author_id: user.id,
      title,
      content,
      category,
      tags,
    });
    if (error) throw error;
  }

  // --- Likes ---
  static async toggleLike(contentId: string, isCurrentlyLiked: boolean) {
    const user = await this.getCurrentUser();
    if (!user) return;

    if (isCurrentlyLiked) {
      await supabase.from('likes').delete().match({ user_id: user.id, content_id: contentId });
    } else {
      await supabase.from('likes').insert({ user_id: user.id, content_id: contentId });
    }
  }

  // --- Feedback ---
  static async sendFeedback(email: string, message: string) {
    const { error } = await supabase.from('feedbacks').insert({
      email: email || '익명',
      message: message,
    });
    if (error) throw error;
  }
}
