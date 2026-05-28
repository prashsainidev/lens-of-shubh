import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxhpphwcymohgyfrljrh.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94aHBwaHdjeW1vaGd5ZnJsanJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjkzNzMsImV4cCI6MjA5NTIwNTM3M30.z8rmqxPk0P_OmuZKYswqeQ_QfAVrWODq_Xc20mQWy9k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
