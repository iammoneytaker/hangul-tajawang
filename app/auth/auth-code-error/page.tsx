import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4">
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-zinc-200 dark:border-zinc-800">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h1 className="text-2xl font-black mb-4 text-zinc-900 dark:text-zinc-50">로그인 오류</h1>
        <p className="text-zinc-500 mb-8">
          인증 과정에서 문제가 발생했습니다. <br />
          잠시 후 다시 시도해주세요.
        </p>
        <Link 
          href="/"
          className="block w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}