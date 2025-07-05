import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params
    
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('room_code', roomCode)
      .single()
    
    if (error) {
      return NextResponse.json({ exists: false, error: error.message }, { status: 404 })
    }
    
    return NextResponse.json({ 
      exists: true, 
      room: data 
    })
  } catch (error) {
    return NextResponse.json({ 
      exists: false, 
      error: 'Failed to check room' 
    }, { status: 500 })
  }
} 