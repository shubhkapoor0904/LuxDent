import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://gguvqkrlzyxgjzauvgzj.supabase.co'
// Using the public anon key for safe client access
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdndXZxa3Jsenl4Z2p6YXV2Z3pqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0MTc0MDQsImV4cCI6MjA5MDk5MzQwNH0.h4wRmhprtzW2FH1zJUYYYvjsfNW088SbKCljPPK50Yo'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Check if user is currently authenticated
export async function getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) console.error("Session error:", error)
    return session
}

// Ensure the user is logged in, otherwise redirect
export async function requireAuth() {
    const session = await getSession()
    if (!session) {
        window.location.href = 'login.html'
        return null;
    }
    return session;
}

// Redirect if already logged in (used on login page)
export async function redirectIfAuthenticated() {
    const session = await getSession()
    if (session) {
        window.location.href = 'dashboard.html'
    }
}
