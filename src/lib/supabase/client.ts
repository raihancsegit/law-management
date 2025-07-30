// src/lib/supabase/client.ts
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/supabase'

// আগের কোডে, আমরা একটি ভেরিয়েবল এক্সপোর্ট করেছিলাম।
// export const supabase = createPagesBrowserClient<Database>()

// নতুন এবং সঠিক কোড: আমরা একটি ফাংশন এক্সপোর্ট করব।
export const createClient = () => createPagesBrowserClient<Database>()