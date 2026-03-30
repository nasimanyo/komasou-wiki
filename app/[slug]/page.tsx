'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import MDEditor from '@uiw/react-md-editor'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  category: string
  author_name: string
  author_avatar?: string
  author_discriminator?: string
  created_by: string
  updated_at: string
}

const categories = [
  'コマンド解説',
  'Tips & Tricks',
  'チュートリアル',
  'データパック',
  'アドオン',
  'テクスチャ',
  'その他'
]

export default function PageView() {
  const params = useParams()
  const router = useRouter()
  const [page, setPage] = useState<Page | null>(null)
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    const getPage = async () => {
      const response = await fetch(`/api/pages/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setPage(data)
        setEditTitle(data.title)
        setEditContent(data.content)
        setEditCategory(data.category)
      } else {
        router.push('/')
      }
    }

    getUser()
    getPage()
  }, [params.slug, supabase, router])

  const handleEdit = () => {
    setEditing(true)
  }

  const handleSave = async () => {
    setLoading(true)
    const response = await fetch(`/api/pages/${params.slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title: editTitle, content: editContent, category: editCategory }),
    })
    if (response.ok) {
      const updatedPage = await response.json()
      setPage(updatedPage)
      setEditing(false)
    } else {
      alert('エラーが発生しました')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (confirm('本当に削除しますか？')) {
      const response = await fetch(`/api/pages/${params.slug}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        router.push('/')
      } else {
        alert('エラーが発生しました')
      }
    }
  }

  if (!page) {
    return <div>Loading...</div>
  }

  const canEdit = user && page.created_by === user.id

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">コマ相wiki</h1>
            <a href="/" className="text-blue-600 hover:underline">ホーム</a>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white p-6 rounded shadow">
          {editing ? (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">タイトル</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-2xl font-bold w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
                <MDEditor
                  value={editContent}
                  onChange={(val) => setEditContent(val || '')}
                  preview="edit"
                />
              </div>
              <div className="mt-4 space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full font-medium">
                  {page.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
              <div className="prose max-w-none">
                <ReactMarkdown>{page.content}</ReactMarkdown>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <img
                      src={
                        page.author_avatar
                          ? `https://cdn.discordapp.com/avatars/${page.created_by}/${page.author_avatar}.png`
                          : `https://cdn.discordapp.com/embed/avatars/${parseInt(page.author_discriminator || '0') % 5}.png`
                      }
                      alt="Author Avatar"
                      className="w-6 h-6 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = `https://cdn.discordapp.com/embed/avatars/${parseInt(page.author_discriminator || '0') % 5}.png`;
                      }}
                    />
                    <span>作成者: {page.author_name}</span>
                    <span>•</span>
                    <span>最終更新: {new Date(page.updated_at).toLocaleString()}</span>
                  </div>
                  {canEdit && (
                    <div className="space-x-2">
                      <button
                        onClick={handleEdit}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        編集
                      </button>
                      <button
                        onClick={handleDelete}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}