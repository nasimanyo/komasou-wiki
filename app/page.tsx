'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Page {
  id: string
  title: string
  slug: string
  category: string
  author_name: string
  author_avatar?: string
  author_discriminator?: string
  created_at: string
}

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [pages, setPages] = useState<Page[]>([])
  const [featuredPages, setFeaturedPages] = useState<Page[]>([])
  const [supabase, setSupabase] = useState<any>(null)

  useEffect(() => {
    // ブラウザ環境でのみSupabaseクライアントを作成
    if (typeof window !== 'undefined') {
      const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      setSupabase(client)
    }
  }, [])

  useEffect(() => {
    if (!supabase) return

    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const getPages = async () => {
      const response = await fetch('/api/pages')
      const data = await response.json()
      setPages(data)
      // おすすめ記事（ランダムに3つ）
      const shuffled = [...data].sort(() => 0.5 - Math.random())
      setFeaturedPages(shuffled.slice(0, 3))
    }

    getUser()
    getPages()
  }, [supabase])

  const handleLogout = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">コマ相wiki</h1>
              <span className="text-sm text-gray-500">マイクラコマンド相談所の公式Wiki</span>
            </div>
            <div className="flex items-center space-x-4">
              {user && <Link href="/create" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">新規作成</Link>}
              {user ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  ログアウト
                </button>
              ) : (
                <Link href="/login" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">ログイン</Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* 統計 */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Wiki統計</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{pages.length}</div>
                <div className="text-gray-600">記事数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{user ? 1 : 0}</div>
                <div className="text-gray-600">アクティブユーザー</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {pages.length > 0 ? Math.floor(pages.reduce((acc, page) => acc + new Date(page.created_at).getTime(), 0) / pages.length / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-gray-600">平均記事年齢（日）</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 最近の記事 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">最近の記事</h2>
              <div className="space-y-4">
                {pages.slice(0, 10).map((page) => (
                  <div key={page.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/${page.slug}`} className="text-lg font-medium text-blue-600 hover:underline">
                          {page.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {page.category}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(page.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && (
                  <p className="text-gray-500">まだ記事がありません。最初の記事を作成しましょう！</p>
                )}
              </div>
            </div>
          </div>

          {/* おすすめ記事 */}
          <div>
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">おすすめ記事</h2>
              <div className="space-y-4">
                {featuredPages.map((page) => (
                  <div key={page.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Link href={`/${page.slug}`} className="text-lg font-medium text-blue-600 hover:underline">
                          {page.title}
                        </Link>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {page.category}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {new Date(page.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {pages.length === 0 && (
                  <p className="text-gray-500">記事を作成するとここに表示されます。</p>
                )}
              </div>
            </div>

            {/* クイックアクション */}
            {user && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">クイックアクション</h2>
                <div className="space-y-2">
                  <Link href="/create" className="block w-full bg-blue-500 text-white text-center px-4 py-2 rounded hover:bg-blue-600">
                    新しい記事を作成
                  </Link>
                  <p className="text-sm text-gray-600">
                    マイクラコマンドの使い方やTipsを共有しましょう！
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 コマ相wiki - マイクラコマンド相談所公式Wiki
          </p>
        </div>
      </footer>
    </div>
  )
}
