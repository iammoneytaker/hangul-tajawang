import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// SSR 대응을 위해 브라우저용 클라이언트를 사용합니다. (쿠키 자동 관리)
export const supabase = createBrowserClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      flowType: 'pkce',
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    }
  }
);

export type SortType = '최신순' | '인기순' | '댓글순' | '도전순';

export class SupabaseService {
  // --- Auth ---
  static async signInWithKakao() {
    const SCOPES = 'account_email profile_nickname profile_image';
    
    // 현재 접속한 도메인을 기반으로 콜백 주소 생성
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.hangul-tajawang.com';
    const redirectUrl = `${origin.replace(/\/$/, '')}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        scopes: SCOPES,
        redirectTo: redirectUrl,
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
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return null;
    }
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

  static async uploadAvatar(file: File) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    await this.updateProfile({ avatar_url: publicUrl });
    return publicUrl;
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
      const { data: existingResult } = await supabase.from('typing_results').select('id').match({ user_id: user.id, content_id: contentId }).maybeSingle();
      await supabase.from('typing_results').insert({ user_id: user.id, content_id: contentId, speed, accuracy, elapsed_seconds: elapsedSeconds });
      if (!existingResult) {
        await supabase.rpc('increment_counter', { t_name: 'typing_contents', c_name: 'complete_count', row_id: contentId });
      }
      const { data: profile } = await supabase.from('profiles').select('best_speed').eq('id', user.id).single();
      if (speed > (profile?.best_speed || 0)) await this.updateProfile({ best_speed: speed });
    } catch (e) { console.error(e); }
  }

  static async getMyResults() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase.from('typing_results').select('*, typing_contents(title)').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  static async getContents(category?: string, sortBy: SortType = '최신순', authorId?: string) {
    let query = supabase.from('typing_contents').select('*, profiles!typing_contents_author_id_fkey(nickname, avatar_url), typing_results(user_id), typing_comments(id)').lt('report_count', 10);
    if (category && category !== '전체') query = query.eq('category', category);
    if (authorId) query = query.eq('author_id', authorId);
    const { data, error } = await query;
    if (error) throw error;
    const processed = data.map((item: any) => ({ ...item, comment_count: item.typing_comments?.length || 0, unique_participant_count: new Set(item.typing_results?.map((r: any) => r.user_id)).size }));
    if (sortBy === '인기순') return processed.sort((a, b) => (b.like_count || 0) - (a.like_count || 0));
    if (sortBy === '도전순') return processed.sort((a, b) => (b.complete_count || 0) - (a.complete_count || 0));
    if (sortBy === '댓글순') return processed.sort((a, b) => (b.comment_count || 0) - (a.comment_count || 0));
    return processed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  static async getContentById(contentId: string) {
    const { data, error } = await supabase.from('typing_contents').select('*, profiles!typing_contents_author_id_fkey(nickname, avatar_url, best_speed), typing_results(user_id, speed, accuracy, created_at), typing_comments(*, profiles(nickname, avatar_url))').eq('id', contentId).single();
    if (error) throw error;
    return { ...data, comment_count: data.typing_comments?.length || 0, unique_participant_count: new Set(data.typing_results?.map((r: any) => r.user_id)).size };
  }

  static async incrementViewCount(contentId: string) {
    await supabase.rpc('increment_counter', { t_name: 'typing_contents', c_name: 'web_view_count', row_id: contentId });
  }

  static async getMyContents() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase.from('typing_contents').select('*, typing_results(user_id), typing_comments(id)').eq('author_id', user.id).order('created_at', { ascending: false });
    return (data || []).map((item: any) => ({ ...item, comment_count: item.typing_comments?.length || 0 }));
  }

  static async getAuthorContents(authorId: string, limit: number = 30) {
    const { data, error } = await supabase.from('typing_contents').select('*, typing_results(user_id), typing_comments(id)').eq('author_id', authorId).order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return data.map((item: any) => ({ ...item, comment_count: item.typing_comments?.length || 0 }));
  }

  static async getRelatedContents(authorId: string, currentContentId: string) {
    const { data: authorOther } = await supabase.from('typing_contents').select('id, title, category, complete_count, like_count').eq('author_id', authorId).neq('id', currentContentId).order('created_at', { ascending: false }).limit(3);
    const { data: popular } = await supabase.from('typing_contents').select('id, title, category, complete_count, like_count').neq('id', currentContentId).order('complete_count', { ascending: false }).limit(3);
    return { authorOther: authorOther || [], popular: popular || [] };
  }

  static async createContent({ title, content, category }: { title: string; content: string; category: string }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    const { error } = await supabase.from('typing_contents').insert({ author_id: user.id, title, content, category });
    if (error) throw error;
  }

  static async updateContent({ contentId, title, content, category }: { contentId: string; title: string; content: string; category: string }) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    const { error } = await supabase.from('typing_contents').update({ title, content, category }).eq('id', contentId).eq('author_id', user.id);
    if (error) throw error;
  }

  static async deleteContent(contentId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    const { error } = await supabase.from('typing_contents').delete().eq('id', contentId).eq('author_id', user.id);
    if (error) throw error;
  }

  static async getLikedContents() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase.from('likes').select('typing_contents(*)').eq('user_id', user.id);
    if (error) throw error;
    return (data || []).map((item: any) => item.typing_contents);
  }

  // --- 소셜 (Likes, Comments, Activities) ---
  static async toggleLike(contentId: string, isCurrentlyLiked: boolean, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    if (isCurrentlyLiked) {
      await supabase.from('likes').delete().match({ user_id: user.id, content_id: contentId });
      await supabase.rpc('sync_like_count', { content_id: contentId, delta: -1 });
    } else {
      await supabase.from('likes').insert({ user_id: user.id, content_id: contentId });
      await supabase.rpc('sync_like_count', { content_id: contentId, delta: 1 });
      if (user.id !== authorId) await supabase.from('typing_activities').insert({ receiver_id: authorId, actor_id: user.id, type: 'like', content_id: contentId });
    }
  }

  static async addComment(contentId: string, comment: string, authorId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    const { error } = await supabase.from('typing_comments').insert({ content_id: contentId, user_id: user.id, comment });
    if (error) throw error;
    if (user.id !== authorId) await supabase.from('typing_activities').insert({ receiver_id: authorId, actor_id: user.id, type: 'comment', content_id: contentId });
  }

  static async deleteComment(commentId: string) {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('로그인 필요');
    await supabase.from('typing_comments').delete().eq('id', commentId).eq('user_id', user.id);
  }

  static async getActivities() {
    const user = await this.getCurrentUser();
    if (!user) return [];
    const { data, error } = await supabase.from('typing_activities').select('*, actor:profiles!typing_activities_actor_id_fkey(nickname, avatar_url), content:typing_contents(title)').eq('receiver_id', user.id).order('created_at', { ascending: false }).limit(30);
    if (error) throw error;
    return data;
  }

  static async getUnreadActivityCount() {
    const user = await this.getCurrentUser();
    if (!user) return 0;
    const { count } = await supabase.from('typing_activities').select('*', { count: 'exact', head: true }).eq('receiver_id', user.id).eq('is_read', false);
    return count || 0;
  }

  static async markActivitiesAsRead() {
    const user = await this.getCurrentUser();
    if (!user) return;
    await supabase.from('typing_activities').update({ is_read: true }).eq('receiver_id', user.id).eq('is_read', false);
  }

  // --- Game Scores ---
  static async saveGameScore(gameType: string, score: number, level: number, maxCombo: number = 0) {
    const user = await this.getCurrentUser();
    if (!user) return;

    const { error } = await supabase.from('game_scores').insert({
      user_id: user.id,
      game_type: gameType,
      score: score,
      level: level,
      max_combo: maxCombo
    });
    if (error) throw error;
  }

  static async getGameRankings(gameType: string, limit: number = 10) {
    const { data, error } = await supabase
      .from('game_scores')
      .select(`
        score,
        level,
        max_combo,
        created_at,
        profiles!game_scores_user_id_fkey(nickname, avatar_url)
      `)
      .eq('game_type', gameType)
      .order('score', { ascending: false })
      .limit(limit);
      
    if (error) throw error;
    return data;
  }
}
