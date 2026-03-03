import React from "react";
import Link from "next/link";
import { ChevronLeft, Mail, MessageCircle, Clock, AlertCircle } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 font-sans py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-blue-600 transition-colors">
          <ChevronLeft size={16} /> 홈으로 돌아가기
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          {/* Header */}
          <div className="p-10 md:p-16 text-center bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
            <div className="w-20 h-20 bg-blue-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 dark:shadow-none rotate-3">
              <Mail size={40} />
            </div>
            <h1 className="text-4xl font-black mb-4">문의하기</h1>
            <p className="text-zinc-500 max-w-md mx-auto leading-relaxed">
              서비스 이용 중 불편한 점이나 제안하고 싶은 기능이 있으신가요? <br/>
              언제든 편하게 연락 주시면 정성껏 답변해 드리겠습니다.
            </p>
          </div>

          {/* Contact Info */}
          <div className="p-10 md:p-16 space-y-10">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-700 transition-all hover:border-blue-200 group">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Official Email</p>
                <h3 className="text-xl font-black mb-2 group-hover:text-blue-600 transition-colors">이메일 문의</h3>
                <p className="text-sm text-zinc-500 mb-6">가장 빠른 답변을 받으실 수 있는 창구입니다.</p>
                <a 
                  href="mailto:withanalog@gmail.com" 
                  className="text-lg font-black text-zinc-900 dark:text-zinc-100 border-b-2 border-blue-200 hover:border-blue-600 transition-all"
                >
                  withanalog@gmail.com
                </a>
              </div>

              <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-700">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">Response Time</p>
                <h3 className="text-xl font-black mb-2">답변 시간</h3>
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <Clock size={14} className="text-blue-500" />
                    <span>평일 10:00 - 18:00</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <MessageCircle size={14} className="text-blue-500" />
                    <span>주말/공휴일 휴무</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-3xl border border-blue-100 dark:border-blue-800 flex items-start gap-4">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h4 className="font-black text-blue-900 dark:text-blue-400 mb-1">참고해 주세요</h4>
                <p className="text-sm text-blue-700/70 dark:text-blue-400/70 leading-relaxed">
                  문의 시 사용 중인 기기 정보(PC/모바일 등)와 브라우저 정보를 함께 보내주시면 더 정확한 안내가 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 bg-zinc-50/30 text-center border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">© 2026 한글타자왕 Support Team</p>
          </div>
        </div>
      </div>
    </div>
  );
}
