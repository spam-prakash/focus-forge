import React, { useState } from 'react'
import axios from 'axios'
import { Bot, Send, Sparkles, Loader } from 'lucide-react'
import toast from 'react-hot-toast'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function AIAssistant () {
  const [question, setQuestion] = useState('')
  const [chat, setChat] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const askAI = async () => {
    if (!question.trim()) return
    
    setIsLoading(true)
    setChat(prev => [...prev, { role: 'user', content: question }])
    
    try {
      const response = await axios.post(`${API_URL}/ai/assistant`, { question })
      setChat(prev => [...prev, { role: 'assistant', content: response.data.answer }])
      setQuestion('')
    } catch (error) {
      toast.error('Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden'>
      <div className='p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-500 to-pink-500'>
        <div className='flex items-center gap-2 text-white'>
          <Bot size={24} />
          <h3 className='font-semibold'>AI Study Assistant</h3>
          <Sparkles size={16} className='ml-auto' />
        </div>
      </div>

      <div className='h-96 overflow-y-auto p-4 space-y-4'>
        {chat.length === 0 && (
          <div className='text-center text-gray-500 dark:text-gray-400 py-8'>
            <Bot size={48} className='mx-auto mb-3 opacity-50' />
            <p>Ask me anything about your studies!</p>
            <p className='text-sm mt-2'>Try: "What should I prioritize?"</p>
          </div>
        )}

        {chat.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className='flex justify-start'>
            <div className='bg-gray-100 dark:bg-gray-800 p-3 rounded-lg'>
              <Loader className='animate-spin' size={20} />
            </div>
          </div>
        )}
      </div>

      <div className='p-4 border-t border-gray-200 dark:border-gray-800 flex gap-2'>
        <input
          type='text'
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && askAI()}
          placeholder='Ask AI for advice...'
          className='flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
        />
        <button
          onClick={askAI}
          disabled={isLoading}
          className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50'
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
