import { NextRequest } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { getRandomWords } from '@/lib/words'

// This will be handled by a separate server file
export async function GET(req: NextRequest) {
  return new Response('Socket.IO server should be running separately', { status: 200 })
}