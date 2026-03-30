'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MDEditor from '@uiw/react-md-editor'

const categories = [
  'コマンド解説',
  'Tips & Tricks',
  'チュートリアル',
  'データパック',
  'アドオン',
  'テクスチャ',
  'その他'
]

export default function CreatePage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, content, category }),
    })
    if (response.ok) {
      const page = await response.json()
      router.push(`/${page.slug}`)
    } else {
      const errorData = await response.json()
      setError(errorData.error || 'エラーが発生しました')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">コマ相wiki</h1>
              <span className="text-sm text-gray-500">新規記事作成</span>
            </div>
            <a href="/" className="text-blue-600 hover:underline font-medium">← ホームに戻る</a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 className="text-xl font-semibold text-white">新しい記事を作成</h2>
            <p className="text-blue-100 text-sm mt-1">マイクラコマンドの知識を共有しましょう</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 作成者情報 */}
            {user && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        user.user_metadata?.avatar
                          ? `https://cdn.discordapp.com/avatars/${user.user_metadata.id}/${user.user_metadata.avatar}.png`
                          : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.user_metadata?.discriminator || '0') % 5}.png`
                      }
                      alt="Discord Avatar"
                      className="w-10 h-10 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(user.user_metadata?.discriminator || '0') % 5}.png`;
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      作成者: {user.user_metadata?.username || user.user_metadata?.full_name || user.email}
                    </p>
                    <p className="text-xs text-gray-500">
                      記事は作成後に編集・削除が可能です
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                記事タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例: /giveコマンドの使い方"
                required
              />
              <p className="text-xs text-gray-500 mt-1">明確でわかりやすいタイトルをつけましょう</p>
            </div>

            {/* カテゴリ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">カテゴリを選択してください</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">記事の内容に合ったカテゴリを選んでください</p>
            </div>

            {/* 内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                記事内容 <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <MDEditor
                  value={content}
                  onChange={(val) => setContent(val || '')}
                  preview="edit"
                  hideToolbar={false}
                  visibleDragbar={false}
                  className="min-h-[400px]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Markdown形式で記述できます。コードブロックを使ってコマンドをきれいに表示しましょう。
              </p>
            </div>

            {/* プレビュー */}
            {content && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  プレビュー
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <MDEditor.Markdown source={content} />
                  </div>
                </div>
              </div>
            )}

            {/* ボタン */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <a
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </a>
              <button
                type="submit"
                disabled={loading || !title.trim() || !content.trim() || !category}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>作成中...</span>
                  </div>
                ) : (
                  '記事を作成'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ヘルプ */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">作成のヒント</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• タイトルは簡潔に、内容がわかるようにする</li>
            <li>• コマンドは ```minecraft コードブロックで囲む</li>
            <li>• 画像は後で追加できるようになります</li>
            <li>• 作成後は編集・削除が可能です</li>
          </ul>
        </div>
      </main>
    </div>
  )
}